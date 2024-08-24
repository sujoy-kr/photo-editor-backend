const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const connectDB = require('./config/db')
const { connectMQ } = require('./config/rabbitMQ')
const { initializeSocket } = require('./config/socket')
const path = require('path')

const env = require('dotenv')
env.config()

const imageRoutes = require('./routes/imageRoutes')

const app = express()
const server = http.createServer(app)
const port = process.env.PORT || 4000

// Connect to database and RabbitMQ
connectDB()
connectMQ()
initializeSocket(server)

// Middlewares
app.use(helmet())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(morgan('dev'))

// Routes
app.use('/', imageRoutes)

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Error Handling Middleware
app.use((req, res, next) => {
    res.status(404).json({ message: 'Page Not Found' })
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ message: 'Internal Server Error' })
})

// Start server
server.listen(port, () => {
    console.log(`Image Service running on port ${port}`)
})
