module.exports = {
    services: [
        {
            route: '/api/user',
            target: process.env.USER_SERVICE_URL,
        },
        {
            route: '/api/image',
            target: process.env.IMAGE_SERVICE_URL,
        },
        {
            route: '/api/access',
            target: process.env.ACCESS_SERVICE_URL,
        },
    ],
}
