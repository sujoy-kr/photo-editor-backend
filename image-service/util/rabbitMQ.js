const { getChannel } = require('../config/rabbitMQ')

const doSomething = async () => {
    const channel = await getChannel()
    channel.sendToQueue('NAME', Buffer.from(JSON.stringify({})))
}

module.exports = { doSomething }
