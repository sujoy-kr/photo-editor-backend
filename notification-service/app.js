const express = require('express')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
// const { redisClient } = require('./config/redis')
require('dotenv').config()
const { connectMQ } = require('./config/rabbitMQ')

const app = express()
const port = process.env.PORT || 6000

connectMQ()

// redisClient.connect()

app.use(helmet())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

app.use(morgan('dev'))

app.use((req, res) => {
    res.status(404).json({ message: 'Page Not Found' })
})

app.listen(port, () => {
    console.log(`Notification Service running on port ${port}`)
})
