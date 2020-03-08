'use strict';

const results = require('../scraper');

module.exports = function(server) {
  // Install a `/` route that returns server status
  const router = server.loopback.Router();
  router.get('/', async function(req, res, next) {
    const result = await results();
    res.json(result);
  });
  server.use(router);
};
