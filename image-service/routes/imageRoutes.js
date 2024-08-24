const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const { multerMiddleware } = require('../middlewares/multer')
const {
    getAllImages,
    uploadImage,
    getSingleImage,
    editImage,
    deleteImage,
} = require('../controllers/imageController')

router.get('/', auth.required, getAllImages)
router.post('/', auth.required, multerMiddleware, uploadImage)
router.get('/:id', auth.required, getSingleImage)
router.post('/:id/edit', auth.required, editImage)
router.delete('/:id', auth.required, deleteImage)

module.exports = router
