const { getChannel } = require('../config/rabbitMQ')

const grantAccess = async (imageId, userId) => {
    try {
        const channel = await getChannel()
        channel.sendToQueue(
            'GRANTACCESS',
            Buffer.from(
                JSON.stringify({
                    imageId,
                    userId,
                })
            )
        )
    } catch (err) {
        console.log('RabbitMQ error:', err)
        process.exit(1)
    }
}

module.exports = { grantAccess }
