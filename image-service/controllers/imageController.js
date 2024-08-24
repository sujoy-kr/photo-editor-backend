const Image = require('../models/Image')
const removeFile = require('../util/removeFile')

const getAllImages = async (req, res) => {
    try {
        const images = await Image.find()
        res.status(200).json(images)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const getSingleImage = async (req, res) => {
    try {
        let { id } = req.params

        if (!id) {
            return res.status(404).json({ message: 'No ID Found' })
        }

        const image = await Image.findById(id)

        if (!image) {
            return res.status(404).json({ message: 'No Image Found' })
        }

        res.status(200).json(image)
    } catch (err) {
        res.status(500).json({ message: err.message })
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

        const image = new Image({
            userId: userId,
            image: fileUrl,
            metadata: {
                height: 'demo',
                weight: 'demo',
            },
        })

        try {
            await image.save()
            res.status(201).json({ message: 'Image Uploaded' })
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
    uploadImage,
    deleteImage,
}
