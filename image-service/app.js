const express = require('express')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const connectDB = require('./config/db')
const { connectMQ } = require('./config/rabbitMQ')

const env = require('dotenv')
env.config()

const imageRoutes = require('./routes/imageRoutes')

const app = express()
const port = process.env.PORT || 4000

connectDB()
connectMQ()

app.use(helmet())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

app.use(morgan('dev'))

app.use('/', imageRoutes)

app.use((req, res) => {
    res.status(404).json({ message: 'Page Not Found' })
})

app.listen(port, () => {
    console.log(`Image Service running on port ${port}`)
})
