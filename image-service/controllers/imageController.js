const Image = require('../models/Image')
const removeFile = require('../util/removeFile')
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')

const getAllImages = async (req, res) => {
    try {
        const { userId } = req.data

        if (!userId) {
            return res.status(400).json({ message: 'No User ID Found' })
        }

        const images = await Image.find({ userId })
        res.status(200).json(images)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const getSingleImage = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(404).json({ message: 'No ID Found' })
        }

        const image = await Image.findById(id)

        if (!image) {
            return res.status(404).json({ message: 'No Image Found' })
        }

        const file = image.image

        if (file) {
            const filePath = path.resolve(file)

            // Check if the file exists
            if (fs.existsSync(filePath)) {
                res.status(200).download(filePath)
            } else {
                // Handle case where the file does not exist on the server
                res.status(404).json({
                    message: 'Image Not Found On The Server',
                })
            }
        } else {
            res.status(404).json({ message: 'Image Not Found' })
        }

        // res.status(200).json(image)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const generateAccessLink = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(404).json({ message: 'No ID Found' })
        }

        const { userId } = req.data

        if (!userId) {
            return res.status(400).json({ message: 'No User ID Found' })
        }

        const image = await Image.findById(id)

        if (!image) {
            return res.status(404).json({ message: 'No Image Found' })
        }

        if (image.userId !== userId) {
            return res.status(403).json({ message: 'Unauthorized' })
        }

        console.log(image, userId)

        const token = jwt.sign({ imageId: image._id }, process.env.JWT_SECRET)

        const accessLink = `${process.env.HOST_URL}/${token}`

        res.status(200).json({ accessLink })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const editImage = async (req, res) => {
    try {
        let { id } = req.params

        if (!id) {
            return res.status(404).json({ message: 'No ID Found' })
        }

        console.log('req.data', req.data)

        const { userId } = req.data

        if (!userId) {
            return res.status(400).json({ message: 'No User ID Found' })
        }

        const imgToEdit = await Image.findById(id)

        if (!imgToEdit) {
            return res.status(404).json({ message: 'No Image Found' })
        }

        if (imgToEdit.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized' })
        }

        const filePath = path.resolve(imgToEdit.image)

        const transformations = req.body.transformations || {}
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

        if (transformations.filters && transformations.filters.grayscale) {
            imgBuffer = await sharp(imgBuffer).grayscale().toBuffer()
        }

        if (transformations.filters && transformations.filters.sepia) {
            imgBuffer = await sharp(imgBuffer)
                .tint({ r: 112, g: 66, b: 20 })
                .toBuffer()
        }

        if (transformations.format) {
            const format = transformations.format.toLowerCase()
            imgBuffer = await sharp(imgBuffer).toFormat(format).toBuffer()

            const newFilePath = imgToEdit.image.replace(
                /\.[^/.]+$/,
                `.${format}`
            )

            const newAbsFilepath = path.resolve(newFilePath)
            fs.writeFileSync(newFilePath, imgBuffer)

            if (newFilePath !== imgToEdit.image) {
                removeFile(imgToEdit.image)
                imgToEdit.image = newFilePath
            }
        } else {
            const AbsFilepath = path.resolve(imgToEdit.image)
            fs.writeFileSync(AbsFilepath, imgBuffer)
        }

        const { acc, ...rest } = await sharp(imgBuffer).metadata()
        imgToEdit.metadata = rest

        await imgToEdit.save(path.resolve(imgToEdit.image))
        // res.status(200).json({
        //     message: 'Image Edited Successfully',
        // })

        res.status(200).download(filePath)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Unexpected Server Error' })
    }
}

const uploadImage = async (req, res) => {
    try {
        console.log('req.data', req.data)

        const { userId } = req.data

        if (!userId) {
            removeFile(req.file)
            return res.status(400).json({ message: 'No User ID Found' })
        }

        const fileUrl = req.file.path

        // Use sharp to collect metadata
        const imageBuffer = fs.readFileSync(fileUrl)
        const { icc, ...restOfTheMetadata } = await sharp(
            imageBuffer
        ).metadata()

        const image = new Image({
            userId: userId,
            image: fileUrl,
            metadata: restOfTheMetadata,
        })

        try {
            await image.save()
            // res.status(201).json({ message: 'Image Uploaded' })
            res.status(201).json(image)
        } catch (saveErr) {
            // If saving fails, remove the file and return an error
            removeFile(req.file)
            throw new Error('Error saving image: ' + saveErr.message)
        }
    } catch (err) {
        removeFile(req.file)
        res.status(500).json({ message: err.message })
    }
}

const deleteImage = async (req, res) => {
    try {
        let { id } = req.params

        if (!id) {
            return res.status(404).json({ message: 'No ID Found' })
        }

        const imgToDelete = await Image.findById(id)

        if (!imgToDelete) {
            return res.status(404).json({ message: 'No Image Found' })
        }

        removeFile(imgToDelete.image)

        await Image.findByIdAndDelete(id)

        res.status(200).json({ message: 'Successfully Deleted' })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Unexpected Server Error' })
    }
}

module.exports = {
    getAllImages,
    getSingleImage,
    generateAccessLink,
    editImage,
    uploadImage,
    deleteImage,
}
