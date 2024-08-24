// ecosystem.config.js
module.exports = {
    apps: [
        {
            name: 'api-gateway',
            script: './api-gateway/app.js',
            env: {
                NODE_ENV: 'development',
                PORT: 2000,
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
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
        {
            name: 'access-service',
            script: './access-service/app.js',
            env: {
                NODE_ENV: 'development',
                PORT: 3000,
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
    ],
}
