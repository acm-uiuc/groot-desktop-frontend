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
const path = require('path');
const request = require('request');
const moment = require('moment');
const utils = require('../../etc/utils.js');

module.exports = function(app) {
  app.get('/gigs', function(req, res) {
    if (!req.session.roles.isStudent) {
      return res.redirect('/login');
    }
    request({
      url: `${SERVICES_URL}/gigs`,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
      },
      qs: {
        page: req.query.page,
        filter: req.query.filter
      },
      json: true
    }, function(err, response, body) {
      if(err || body.error || !body.gigs) {
        req.flash('error', 'Unable to fetch gigs');
        return res.redirect('/intranet');
      }
      var gigs = body.gigs.map(function(gig) {
        gig.created_at = moment(gig.created_at).fromNow();
        return gig;
      });
      return res.render('gigs/gigs', {
        authenticated: utils.isAuthenticated(req),
        messages: req.flash('success'),
        errors: req.flash('error'),
        gigs: gigs,
        nextPage: body.next_page,
        prevPage: body.prev_page,
        isAdmin: utils.validApprovalAuth(req)
      });
    });
  });
  app.post('/gigs', function(req, res) {

  });
}