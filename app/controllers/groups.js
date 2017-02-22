/**
* Copyright © 2017, ACM@UIUC
*
* This file is part of the Groot Project.  
* 
* The Groot Project is open source software, released under the University of
* Illinois/NCSA Open Source License. You should have received a copy of
* this license in a file with the distribution.
**/

const SERVICES_URL = process.env.SERVICES_URL || 'http://localhost:8000';
const GROOT_ACCESS_TOKEN = process.env.GROOT_ACCESS_TOKEN || "TEMP_STRING";
const request = require('request');
const utils = require('../../etc/utils.js');

module.exports = function(app) {
  app.get('/join', function(req, res) {
    if(utils.isAuthenticated(req)) {
      return res.redirect('/intranet');
    }

    request({
      url: `${SERVICES_URL}/groups/sigs`,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN
      },
      method: "GET",
    }, function(err, response, body) {
      if (err || !response || response.statusCode != 200) {
        return res.status(500).send(err);
      }
      res.render('users/join', {
        authenticated: false,
        sigs: JSON.parse(body),
        messages: req.flash('success'),
        errors: req.flash('error')
      });
    });
  });

  app.get('/sigs', function(req, res) {
    request({
      url: `${SERVICES_URL}/groups/sigs`,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN
      },
      method: "GET",
    }, function(err, response, body) {
      if (err || !response || !response.statusCode) {
        return res.status(500).send(err);
      }

      var sigs = JSON.parse(body);
      var sigs_a = sigs.slice(0, (sigs.length / 2) + 1);
      var sigs_b = sigs.slice(sigs.length / 2 + 1, sigs.length);
      res.render('groups/sigs', {
        authenticated: utils.isAuthenticated(req),
        sig_col_a: sigs_a,
        sig_col_b: sigs_b,
      });
    });
  });

  app.get('/about', function(req, res) {
    request({
      url: `${SERVICES_URL}/groups/committees`,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN
      },
      method: "GET"
    }, function(err, response, body) {
      if (err) {
        return res.status(404).send("Error:\nThis page will be implemented soon!");
      }

      res.render('desktop/about', {
        authenticated: utils.isAuthenticated(req),
        committees: JSON.parse(body),
      });
    });
  });
};