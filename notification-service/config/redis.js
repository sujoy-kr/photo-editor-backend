const Redis = require('ioredis')

const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
})

redisClient.on('error', (err) => {
    console.error('Redis error:', err)
})

redisClient.on('connect', () => {
    console.log('Connected to Redis - Notification Service')
})

module.exports = { redisClient }
