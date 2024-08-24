// ecosystem.config.js
module.exports = {
    apps: [
        {
            name: 'user-service',
            script: './user-service/app.js',
            env: {
                NODE_ENV: 'development',
                PORT: 3000,
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
        {
            name: 'image-service',
            script: './image-service/app.js',
            env: {
                NODE_ENV: 'development',
                PORT: 4000,
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
    ],
}
