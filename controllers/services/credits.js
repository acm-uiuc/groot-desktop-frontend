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

module.exports = function(app){
  app.get('/credits', function(req, res) {
    if (!req.session.roles.isStudent) {
      return res.redirect('/intranet');
    }

    request({
      url: 'http://127.0.0.1:8765/credits/transactions',
      // url: `${SERVICES_URL}/credits/transactions`,
      method: "GET",
      json: true,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN
      },
      qs: {
        netid: req.session.student.netid
      }
    }, function(error, response, body) {
      if (response && response.statusCode == 200) {
        return res.render('credits', {
          authenticated: true,
          transactions: body.transactions,
          balance: body.balance
        })
      }
      res.sendStatus(500);
    });
  });
  app.get('/credits/purchaseMembership', function(req, res) {

  });
  app.get('/credits/addFunds', function(req, res) {

  });
}