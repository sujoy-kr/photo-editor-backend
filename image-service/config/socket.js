const { Server } = require('socket.io')
const Image = require('../models/Image')
const sharp = require('sharp')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const removeFile = require('../util/removeFile')

const initializeSocket = (server) => {
    try {
        const io = new Server(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        })

        io.on('connection', (socket) => {
            console.log('New client connected:', socket.id)

            // Listen for transformation changes
            socket.on('transformImage', async (data) => {
                try {
                    const jsonData = JSON.parse(data)
                    console.log(jsonData)

                    const { token, imageId, transformations } = jsonData

                    let verifiedToken
                    try {
                        verifiedToken = jwt.verify(
                            token,
                            process.env.JWT_SECRET
                        )
                    } catch (err) {
                        socket.emit('error', { message: 'Unauthorized' })

                        return
                    }

                    if (!verifiedToken || !verifiedToken.userId) {
                        socket.emit('error', { message: 'Unauthorized' })
                        return
                    }

                    const requestedUser = verifiedToken.userId

                    // Apply the transformations (your existing code)
                    let imgToEdit = await Image.findById(imageId)
                    if (!imgToEdit) {
                        socket.emit('error', { message: 'Image not found' })
                        return
                    }

                    if (
                        imgToEdit.userId !== requestedUser &&
                        !imgToEdit.allowedUsers.includes(requestedUser)
                    ) {
                        socket.emit('error', {
                            message:
                                'You do not have the required permissions to edit this image',
                        })
                        return
                    }

                    socket.join(imageId)

                    const filePath = path.resolve(imgToEdit.image)
                    let imgBuffer = fs.readFileSync(filePath)

                    if (transformations.resize) {
                        imgBuffer = await sharp(imgBuffer)
                            .resize(
                                parseInt(transformations.resize.width),
                                parseInt(transformations.resize.height)
                            )
                            .toBuffer()
                    }

                    if (transformations.crop) {
                        imgBuffer = await sharp(imgBuffer)
                            .extract({
                                width: parseInt(transformations.crop.width),
                                height: parseInt(transformations.crop.height),
                                left: parseInt(transformations.crop.x),
                                top: parseInt(transformations.crop.y),
                            })
                            .toBuffer()
                    }

                    if (transformations.rotate) {
                        imgBuffer = await sharp(imgBuffer)
                            .rotate(parseInt(transformations.rotate))
                            .toBuffer()
                    }

                    if (transformations.flip) {
                        imgBuffer = await sharp(imgBuffer).flip().toBuffer()
                    }

                    if (transformations.mirror) {
                        imgBuffer = await sharp(imgBuffer).flop().toBuffer()
                    }

                    if (
                        transformations.filters &&
                        transformations.filters.grayscale
                    ) {
                        imgBuffer = await sharp(imgBuffer)
                            .grayscale()
                            .toBuffer()
                    }

                    if (
                        transformations.filters &&
                        transformations.filters.sepia
                    ) {
                        imgBuffer = await sharp(imgBuffer)
                            .tint({ r: 112, g: 66, b: 20 })
                            .toBuffer()
                    }

                    if (transformations.format) {
                        const format = transformations.format.toLowerCase()
                        imgBuffer = await sharp(imgBuffer)
                            .toFormat(format)
                            .toBuffer()

                        const newFilePath = imgToEdit.image.replace(
                            /\.[^/.]+$/,
                            `.${format}`
                        )

                        fs.writeFileSync(newFilePath, imgBuffer)

                        if (newFilePath !== imgToEdit.image) {
                            removeFile(imgToEdit.image)
                            imgToEdit.image = newFilePath
                        }
                    } else {
                        const AbsFilepath = path.resolve(imgToEdit.image)
                        fs.writeFileSync(AbsFilepath, imgBuffer)
                    }

                    // Update image metadata
                    const { acc, ...rest } = await sharp(imgBuffer).metadata()
                    imgToEdit.metadata = rest
                    await imgToEdit.save()

                    // Broadcast the changes to everyone in the room
                    // Emit the updated image to the specific room
                    io.to(imageId).emit(imageId, { imageUrl: imgToEdit.image })
                } catch (err) {
                    console.error('Error applying transformations:', err)
                    socket.emit('error', { message: 'Failed to edit image' })
                }
            })

            // Handle disconnections
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id)
            })
        })
    } catch (err) {
        console.error('Error initializing socket:', err)
    }
}

module.exports = { initializeSocket }
