const { createProxyMiddleware } = require('http-proxy-middleware')

const setProxies = (app, services) => {
    try {
        services.forEach(({ route, target }) => {
            app.use(
                route,
                createProxyMiddleware({
                    target,
                    changeOrigin: true,
                    pathRewrite: {
                        [`^${route}`]: '',
                    },
                })
            )
        })
    } catch (err) {
        console.log('Error in proxy setup:', err)
    }
}

module.exports = { setProxies }
