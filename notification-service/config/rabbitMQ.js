const { redisClient } = require('../config/redis')
const amqp = require('amqplib')
const { sendEmail } = require('../util/mailService')

const connectMQ = async () => {
    try {
        const amqpServer = process.env.AMQP_SERVER
        const connection = await amqp.connect(amqpServer)
        const channel = await connection.createChannel()
        await channel.assertQueue('NOTIFY')
        await channel.assertQueue('USERINFO')
        console.log('RabbitMQ Connected - Notification Service')

        await channel.consume('NOTIFY', async (data) => {
            console.log('Consuming orders to NOTIFY')

            const message = JSON.parse(data.content.toString())
            console.log('messagetosend', message.messageToSend)

            await redisClient.set(
                message.userId.toString(),
                message.messageToSend
            )

            channel.sendToQueue(
                'USER',
                Buffer.from(
                    JSON.stringify({
                        userId: message.userId,
                    })
                )
            )

            channel.ack(data)
        })

        await channel.consume('USERINFO', async (userinfo) => {
            console.log('Consuming user info')

            const returnedData = JSON.parse(userinfo.content.toString())
            console.log(returnedData)

            const message = await redisClient.get(returnedData.id.toString())

            if (message) {
                const messageToSend = `Hello ${returnedData.name},\n` + message

                await sendEmail(returnedData.email, messageToSend)

                await redisClient.del(returnedData.id.toString())
            } else {
                console.log(
                    `No corresponding NOTIFY message found for userId ${returnedData.id}`
                )
            }

            channel.ack(userinfo)
        })
    } catch (err) {
        console.log('RabbitMQ error:', err)
        process.exit(1)
    }
}

module.exports = { connectMQ }
