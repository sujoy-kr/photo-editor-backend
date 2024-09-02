const { createProxyMiddleware } = require('http-proxy-middleware')

const setProxies = (app, services) => {
    try {
        services.forEach(({ route, target }) => {
            app.use(
                route,
                createProxyMiddleware({
                    target,
                    ws: true,
                    changeOrigin: true,
                    pathRewrite: {
                        [`^${route}`]: '',
                    },
                    onError: (err, req, res) => {
                        console.error('Proxy error:', err)
                        res.status(500).json({ message: 'Proxy error' })
                    },
                    onProxyReq: (proxyReq, req, res) => {
                        console.log(`Proxying request to: ${target}${req.url}`)
                    },
                })
            )
        })
    } catch (err) {
        console.log('Error in proxy setup:', err)
    }
}

module.exports = { setProxies }
