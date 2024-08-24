const amqp = require('amqplib')

let channel
const connectMQ = async () => {
    try {
        const amqpServer = process.env.AMQP_SERVER
        const connection = await amqp.connect(amqpServer)
        channel = await connection.createChannel()
        await channel.assertQueue('ACCESS')
        console.log('RabbitMQ Connected - Access Service')

        await channel.consume('ACCESS', async (data) => {
            console.log('Consuming Access Records')

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
