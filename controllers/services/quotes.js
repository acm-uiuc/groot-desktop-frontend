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
const path = require('path');
const ejs = require('ejs');

module.exports = function(app) {
  app.get('/intranet/quotes', function(req, res) {
    if (!req.session.roles.isStudent) {
      return res.redirect('/intranet');
    }

    request({
      url: `${SERVICES_URL}/quotes`,
      method: "GET",
      json: true,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Netid": req.session.student.netid,
        "Token": req.session.student.token
      }
    }, function(error, response, body) {
      if (!error && response && response.statusCode == 200 && body) {
        res.render('quotes', {
          authenticated: true,
          isAdmin: utils.validApprovalAuth(req),
          quotes: body.data,
          messages: req.flash('success'),
          errors: req.flash('error'),
          netid: req.session.student.netid
        });
      } else {
        res.status(500).send(error);
      }
    });
  });

  app.post('/intranet/quotes/new', function(req, res) {
    if (!req.session.roles.isStudent) {
      return res.redirect('/intranet');
    }

    request({
      url: `${SERVICES_URL}/quotes`,
      method: "POST",
      json: true,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Netid": req.session.student.netid,
        "Token": req.session.student.token
      },
      body: req.body
    }, function(error, response, body) {
      if(error || !response) {
        return res.status(500).send(error);
      }

      if (body.error && !body.message) {
        req.flash('error', body.error);
      } else if (!body.error && body.message) {
        req.flash('success', body.message);
      }
      
      res.redirect('/intranet/quotes');
    });
  });

  app.post('/intranet/quotes/:quoteId/vote', function(req, res) {
    if (!req.session.roles.isStudent) {
      res.redirect('/intranet');
    }

    request({
      url: `${SERVICES_URL}/quotes/` + req.params.quoteId + `/vote`,
      method: "POST",
      json: true,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Netid": req.session.student.netid,
        "Token": req.session.student.token
      },
      body: {}
    }, function(error, response, body) {
      res.sendStatus(response.statusCode);
    });
  });

  app.delete('/intranet/quotes/:quoteId/vote', function(req, res) {
    if (!req.session.roles.isStudent) {
      return res.redirect('/intranet');
    }
    
    request({
      url: `${SERVICES_URL}/quotes/` + req.params.quoteId + `/vote`,
      method: "DELETE",
      json: true,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Netid": req.session.student.netid,
        "Token": req.session.student.token
      },
      body: {}
    }, function(error, response, body) {
      res.sendStatus(response.statusCode);
    });
  });

  app.put('/intranet/quotes/:quoteId/approve', function(req, res) {
    if (!utils.validApprovalAuth(req)) {
      res.redirect('/intranet');
    }

    var absQuotesPath = path.resolve(__dirname + '/../../views/_partials/quotes.ejs');
    request({
      url: `${SERVICES_URL}/quotes/` + req.params.quoteId + `/approve`,
      method: "PUT",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Netid": req.session.student.netid,
        "Token": req.session.student.token
      },
      json: true,
      body: {}
    }, function(error, response, body) {
      if (response && response.statusCode == 200 && body) {
        res.status(200).send(ejs.render("<%- include('" + absQuotesPath + "') %>", { quotes : body.data, isAdmin: utils.validApprovalAuth(req) } ));
      } else {
        res.status(response.statusCode).send(error);
      }
    });
  });

  app.delete('/intranet/quotes/:quoteId', function(req, res) {
    if (!utils.validApprovalAuth(req)) {
      return res.redirect('/intranet');
    }

    var absQuotesPath = path.resolve(__dirname + '/../../views/_partials/quotes.ejs');
    request({
      url: `${SERVICES_URL}/quotes/` + req.params.quoteId,
      method: "DELETE",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Netid": req.session.student.netid,
        "Token": req.session.student.token
      },
      json: true,
      body: {}
    }, function(error, response, body) {
      if (response && response.statusCode == 200 && body) {
        res.status(200).send(ejs.render("<%- include('" + absQuotesPath + "') %>", { quotes : body.data, isAdmin: utils.validApprovalAuth(req) } ));
      } else {
        res.status(response.statusCode).send(body.error);
      }
    });
  });
}