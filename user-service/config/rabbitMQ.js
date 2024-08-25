const amqp = require('amqplib')
const prisma = require('../config/db')

const connectMQ = async () => {
    try {
        const amqpServer = process.env.AMQP_SERVER
        const connection = await amqp.connect(amqpServer)
        const channel = await connection.createChannel()
        await channel.assertQueue('USER')
        console.log('RabbitMQ Connected - User Service')

        await channel.consume('USER', async (data) => {
            console.log('Consuming user IDs')

            const message = JSON.parse(data.content.toString())
            console.log(message)

            if (message.userId) {
                const result = await prisma.user.findUnique({
                    where: {
                        id: message.userId,
                    },
                })

                if (!result) {
                    console.log('User not found:', message.userId)
                    channel.ack(data)
                    return
                }

                console.log(result)

                const { password, createdAt, ...userInfo } = result

                channel.sendToQueue(
                    'USERINFO',
                    Buffer.from(JSON.stringify(userInfo))
                )
            }

            channel.ack(data)
        })
    } catch (err) {
        console.log('RabbitMQ error:', err)
        process.exit(1)
    }
}

module.exports = { connectMQ }
