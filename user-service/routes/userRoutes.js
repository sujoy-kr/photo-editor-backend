const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const { limiter } = require('../middlewares/limiter')
const {
    register,
    login,
    profile,
    deleteUser,
} = require('../controllers/userController')

router.post('/register', limiter, register)
router.post('/login', limiter, login)
router.get('/profile', limiter, auth.required, profile)
router.delete('/delete', auth.required, deleteUser)

module.exports = router
