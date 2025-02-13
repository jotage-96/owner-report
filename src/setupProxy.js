const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/external',
    createProxyMiddleware({
      target: 'https://joaoguilherme.stays.com.br',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onProxyRes: function (proxyRes, req, res) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      },
    })
  );
}; 