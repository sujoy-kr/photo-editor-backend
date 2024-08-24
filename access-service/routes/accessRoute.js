const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const { enableAccess } = require('../controllers/accessController')

router.get('/:token', auth.required, enableAccess)

module.exports = router
