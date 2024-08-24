// const prisma = require('../config/db')

// // the createOrder function was moved from orderController/js to here due to circular dependency
// const createOrder = async (data) => {
//     try {
//         console.log(JSON.parse(data.content).quantity)

//         const { userId, productId, quantity } = JSON.parse(data.content)

//         const result = await prisma.order.create({
//             data: {
//                 userId,
//                 productId,
//                 quantity,
//             },
//         })

//         return result
//     } catch (err) {
//         console.log(err)
//         return { message: 'RabbitMQ Order Service Error' }
//     }
// }

// module.exports = { createOrder }
