const { grantAccess } = require('../util/rabbitMQ')
const jwt = require('jsonwebtoken')

const enableAccess = async (req, res) => {
    try {
        console.log('req.data', req.data)

        const { userId } = req.data

        if (!userId) {
            return res.status(400).json({ message: 'No User ID Found' })
        }

        const token = req.params.token

        if (!token) {
            return res.status(404).json({ message: 'ID Missing' })
        }

        const verifiedToken = jwt.verify(token, process.env.JWT_SECRET)

        if (!verifiedToken || !verifiedToken.imageId) {
            return res.status(400).json({ message: 'Invalid Token' })
        }

        grantAccess(verifiedToken.imageId, userId)

        res.status(201).json({
            message: 'Your access request has been submitted for processing.',
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message })
    }
}

module.exports = { enableAccess }
