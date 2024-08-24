const { rateLimit } = require('express-rate-limit')

const limitMinutes = 10 // 10 mins

const limiter = rateLimit({
    windowMs: limitMinutes * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res /*next*/) => {
        res.status(429).json({
            message: `Too many requests from this IP, please try again after ${limitMinutes} minutes`,
        })
    },
})

module.exports = { limiter }
