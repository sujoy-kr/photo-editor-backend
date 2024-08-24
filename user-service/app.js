const express = require('express')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const env = require('dotenv')
const { connectMQ } = require('./config/rabbitMQ')

// routes
const userRoutes = require('./routes/userRoutes')

const app = express()
const port = process.env.PORT || 3000

env.config()
app.use(helmet())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

connectMQ()

app.use(morgan('dev'))

app.use('/', userRoutes)

app.use((req, res) => {
    res.status(404).json({ message: 'Page Not Found' })
})

app.listen(port, () => {
    console.log(`User Service running on port ${port}`)
})
