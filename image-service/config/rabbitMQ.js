const amqp = require('amqplib')
const Image = require('../models/Image')

let channel

const connectMQ = async () => {
    try {
        const amqpServer = process.env.AMQP_SERVER
        const connection = await amqp.connect(amqpServer)
        channel = await connection.createChannel()
        channel.assertQueue('IMAGE')
        console.log('RabbitMQ Connected - Image Service')

        channel.consume('IMAGE', async (data) => {
            console.log('Consuming order results')
            const response = JSON.parse(data.content.toString())
            console.log(response)
            channel.ack(data)
        })
    } catch (err) {
        console.log('RabbitMQ error:', err)
        process.exit(1)
    }
}

const getChannel = async () => {
    if (!channel) {
        await connectMQ()
    }
    return channel
}

module.exports = { connectMQ, getChannel }
