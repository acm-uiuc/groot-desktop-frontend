const SERVICES_URL = process.env.SERVICES_URL || 'http://localhost:8000';
const GROOT_ACCESS_TOKEN = process.env.GROOT_ACCESS_TOKEN || "TEMP_STRING";
const request = require('request');
const utils = require('../../etc/utils.js');

module.exports = function(app) {
  app.get('/events/upcoming', function(req, res) {
    request({
      url: `${SERVICES_URL}/events/upcoming`,
      method: "GET",
      json: true,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN
      }
    }, function(error, response, body) {
      if (response && response.statusCode == 200) {
        res.json(body);
      }
    });
  });
}