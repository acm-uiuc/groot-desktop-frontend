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
const moment = require('moment');
const utils = require('../../etc/utils.js');

module.exports = function(app) {
  app.get('/intranet/gigs', function(req, res) {
    if (!req.session.roles.isStudent) {
      return res.redirect('/login');
    }
    var args = {
      page: req.query.page
    };
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
        req.flash('error', body.error || 'Unable to fetch gigs');
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
  app.post('/intranet/gigs', function(req, res) {
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
        credits: parseInt(req.body.credits),
        admin_task: req.body.admin_gig
      },
      json: true
    }, function(err, response, body) {
      if(err || !body || body.error) {
        req.flash('error', body.error || 'Unable to create gig');
      }
      else {
        req.flash('success', 'Gig created');
      }
      return res.redirect('/intranet/gigs');
    });
  });
  app.get('/intranet/gigs/:gig_id', function(req, res) {
    if (!req.session.roles.isStudent) {
      return res.redirect('/login');
    }
    request({
      url: `${SERVICES_URL}/gigs/${req.params.gig_id}`,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
      },
      json: true
    }, function(err, response, gig) {
      if(err || !gig || gig.error) {
        req.flash('error', gig.error || 'Unable to fetch gig');
        return res.redirect('/intranet/gigs');
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
          req.flash('error', claims.error || 'Unable to fetch claims');
          return res.redirect('/intranet/gigs');
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
  app.delete('/intranet/gigs/:gig_id', function(req, res) {
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
        req.flash('error', body.error || 'Unable to delete gig');
      }
      else {
        req.flash('success', 'Gig deleted');
      }
      return res.redirect('/intranet/gigs');
    });
  });
  app.put('/intranet/gigs/:gig_id', function(req, res) {
    request({
      url: `${SERVICES_URL}/gigs/claims/${req.params.claim_id}`,
      method: "GET",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
      },
      json: true
    }, function(err, response, body) {
      if(body.issuer != req.session.student.netid) {
        req.flash('error', 'Gigs can only be closed by the issuer');
        return res.sendStatus(403);
      }
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
  });
  app.get('/intranet/gigs/claims', function(req, res) {
    if (!req.session.roles.isStudent) {
      return res.sendStatus(403);
    }
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
  app.post('/intranet/gigs/claims', function(req, res) {
    if (!req.session.roles.isStudent) {
      return res.sendStatus(403);
    }
    request({
      url: `${SERVICES_URL}/gigs/claims`,
      method: "POST",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
      },
      body: {
        claimant: req.session.student.netid,
        gig_id: req.body.gig_id
      },
      json: true
    }, function(err, response, body) {
      if(err || response.statusCode != 200) {
        req.flash('error', body.error || 'Unable to create claim');
      }
      else {
        req.flash('success', 'Claim created');
      }
      return res.sendStatus(response.statusCode);
    });
  });
  app.put('/intranet/gigs/claims/:claim_id', function(req, res) {
    if (!req.session.roles.isStudent) {
      return res.sendStatus(403);
    }
    request({
      url: `${SERVICES_URL}/gigs/claims/${req.params.claim_id}`,
      method: "GET",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
      },
      json: true
    }, function(err, response, body) {
      if(body.issuer != req.session.student.netid) {
        req.flash('error', 'Claims can only be accepted by the issuer');
        return res.sendStatus(403);
      }
      request({
        url: `${SERVICES_URL}/gigs/claims/${req.params.claim_id}`,
        method: "PUT",
        headers: {
          "Authorization": GROOT_ACCESS_TOKEN,
        },
        body: {},
        json: true
      }, function(err, response, body) {
        if(err || response.statusCode != 200) {
          req.flash('error', body.error || 'Unable to update claim');
        }
        else {
          req.flash('success', 'Claim accepted');
        }
        return res.sendStatus(response.statusCode);
      });
    });
  });
  app.delete('/intranet/gigs/claims/:claim_id', function(req, res) {
    if (!req.session.roles.isStudent) {
      return res.sendStatus(403);
    }
    request({
      url: `${SERVICES_URL}/gigs/claims/${req.params.claim_id}`,
      method: "GET",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
      },
      json: true
    }, function(err, response, body) {
      if(body.issuer != req.session.student.netid) {
        req.flash('error', 'Claims can only be rejected by the issuer');
        return res.sendStatus(403);
      }
      request({
        url: `${SERVICES_URL}/gigs/claims/${req.params.claim_id}`,
        method: "DELETE",
        headers: {
          "Authorization": GROOT_ACCESS_TOKEN,
        },
        json: true
      }, function(err, response, body) {
        if(err || response.statusCode != 200) {
          req.flash('error', body.error || 'Unable to reject claim');
        }
        else {
          req.flash('success', 'Claim deleted');
        }
        return res.sendStatus(response.statusCode);
      });
    });
  });
};