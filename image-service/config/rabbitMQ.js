const amqp = require('amqplib')
const Image = require('../models/Image')

let channel

const deny = (userId) => {
    channel.sendToQueue(
        'ACCESS',
        Buffer.from(
            JSON.stringify({
                userId,
                message: 'denied',
            })
        )
    )
}

const connectMQ = async () => {
    try {
        const amqpServer = process.env.AMQP_SERVER
        const connection = await amqp.connect(amqpServer)
        channel = await connection.createChannel()
        channel.assertQueue('GRANTACCESS')
        console.log('RabbitMQ Connected - Image Service')

        channel.consume('GRANTACCESS', async (data) => {
            try {
                console.log('Consuming order results')
                const response = JSON.parse(data.content.toString())
                console.log(response)

                if (response.imageId && response.userId) {
                    console.log('imageid, userid found')
                    const image = await Image.findById(response.imageId)
                    if (image) {
                        if (
                            !image.allowedUsers.includes(
                                parseInt(response.userId)
                            )
                        ) {
                            image.allowedUsers.push(response.userId)
                            await image.save()
                            channel.sendToQueue(
                                'ACCESS',
                                Buffer.from(
                                    JSON.stringify({
                                        userId: response.userId,
                                        message: 'granted',
                                    })
                                )
                            )
                        } else {
                            channel.sendToQueue(
                                'ACCESS',
                                Buffer.from(
                                    JSON.stringify({
                                        userId: response.userId,
                                        message: 'already granted',
                                    })
                                )
                            )
                        }
                    } else {
                        console.log('no image found')
                        deny(response.userId)
                    }
                } else {
                    deny(response.userId)
                    console.log('no imageId, userId found')
                }
            } catch (err) {
                console.log(err)
                process.exit(1)
            }

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
