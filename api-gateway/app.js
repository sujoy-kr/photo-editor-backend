const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
require('dotenv').config()

const { setProxies } = require('./utils/proxy')
const config = require('./config/config')

const app = express()

app.use(cors())
app.use(helmet())

setProxies(app, config.services)

app.use((req, res) => {
    res.status(404).json({
        code: 404,
        status: 'Error',
        message: 'Route not found.',
        data: null,
    })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`)
})
