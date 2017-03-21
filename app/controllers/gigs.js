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
    args = {
      page: req.query.page
    }
    switch(req.query.filter) {
      case 'active':
        args.active = true;
        break;
      case 'mine':
        args.issuer = req.session.student.netid;
        break;
      case 'claimed':
        args.claimed_by = req.session.student.netid;
        break;
    }
    request({
      url: `${SERVICES_URL}/gigs`,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
      },
      qs: args,
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
        netid: req.session.student.netid,
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
    if (!req.session.roles.isStudent) {
      return res.redirect('/login');
    }
    request({
      url: `${SERVICES_URL}/gigs`,
      method: "POST",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
      },
      body: {
        issuer: req.session.student.netid,
        title: req.body.title,
        details: req.body.details,
        credits: req.body.credits,
        admin_task: req.body.admin_gig
      },
      json: true
    }, function(err, response, body) {
      if(err || !body || body.error) {
        req.flash('error', 'Unable to create gig');
      }
      else {
        req.flash('success', 'Gig created')
      }
      return res.redirect('/gigs')
    });
  });
  app.get('/gigs/:gig_id', function(req, res) {
    request({
      url: `${SERVICES_URL}/gigs/${req.params.gig_id}`,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
      },
      json: true
    }, function(err, response, gig) {
      if(err || !gig || gig.error) {
        req.flash('error', 'Unable to fetch gig');
        return res.redirect('/gigs');
      }
      var query = {
        gig_id: gig.id
      };
      if(gig.issuer != req.session.student.netid) {
        query.claimant = req.session.student.netid;
      }
      request({
        url: `${SERVICES_URL}/gigs/claims`,
        qs: query,
        headers: {
          "Authorization": GROOT_ACCESS_TOKEN,
        },
        json: true
      }, function(err, response, claims) {
        if(err || !claims || claims.error) {
          req.flash('error', 'Unable to fetch claims');
          return res.redirect('/gigs');
        }
        return res.render('gigs/gig_detail', {
          authenticated: utils.isAuthenticated(req),
          netid: req.session.student.netid,
          messages: req.flash('success'),
          errors: req.flash('error'),
          gig: gig,
          claims: claims,
          isAdmin: utils.validApprovalAuth(req)
        });
      });
    });
  });
  app.post('/gigs/:gig_id/delete', function(req, res) {
    if (!utils.validApprovalAuth(req)) {
      req.flash('error', 'Not authorized to delete gig');
      return res.redirect('/intranet');
    }
    request({
      url: `${SERVICES_URL}/gigs/${req.params.gig_id}`,
      method: "DELETE",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
      },
      json: true
    }, function(err, response, body) {
      if(err || !body || body.error) {
        req.flash('error', 'Unable to delete gig');
      }
      else {
        req.flash('success', 'Gig deleted')
      }
      return res.redirect('/gigs')
    });
  });
  app.put('/gigs/:gig_id', function(req, res) {
    request({
      url: `${SERVICES_URL}/gigs/${req.params.gig_id}`,
      method: "PUT",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN
      },
      json: true,
      body: {}
    }, function(err, response, body) {
      return res.send(body);
    });
  });
  app.get('/gigs/claims', function(req, res) {
    request({
      url: `${SERVICES_URL}/gigs/claims`,
      method: "GET",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
      },
      qs: req.query,
      json: true
    }, function(err, response, body) {
      return res.send(body);
    });
  });
}