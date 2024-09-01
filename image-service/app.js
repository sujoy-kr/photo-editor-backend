const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const promClient = require('prom-client')
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
// app.use(helmet())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(morgan('dev'))

const register = new promClient.Registry()
promClient.collectDefaultMetrics({ register })

const httpRequestDurationMicroseconds = new promClient.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'code'],
    buckets: [50, 100, 200, 300, 400, 500], // Custom bucket values
})
register.registerMetric(httpRequestDurationMicroseconds)

app.use((req, res, next) => {
    const end = httpRequestDurationMicroseconds.startTimer()
    res.on('finish', () => {
        end({ method: req.method, route: req.path, code: res.statusCode })
    })
    next()
})

// Expose metrics at /metrics endpoint
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
})

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

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err)
    process.exit(1) // Optional: Exit the process after handling
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason)
    // Optional: Decide whether to exit or recover
})

// Start server
server.listen(port, () => {
    console.log(`Image Service running on port ${port}`)
})
