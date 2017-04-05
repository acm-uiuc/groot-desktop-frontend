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
  app.get('/memes', function(req, res){
    if (!req.session.roles.isStudent) {
      return res.redirect('/login');
    }
    if(req.query.order == 'unapproved' && !utils.validApprovalAuth(req)) {
      req.flash('error', 'Your power level isn\'t high enough to administer memes.');
      return res.redirect('/memes');
    }
    request({
      url: `${SERVICES_URL}/memes`,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
      },
      qs: {
        page: req.query.page,
        order: req.query.order,
        netid: req.session.student.netid
      },
      json: true
    }, function(err, response, body) {
      if(err || body.error || !body.memes) {
        return res.status(500).send("Couldn't fetch memes. :'(");
      }
      var memes = body.memes.map(function(meme) {
        meme.created_at = moment(meme.created_at).fromNow();
        return meme;
      });
      return res.render('memes/memes', {
        authenticated: utils.isAuthenticated(req),
        messages: req.flash('success'),
        errors: req.flash('error'),
        memes: memes,
        nextPage: body.next_page,
        prevPage: body.prev_page,
        isAdmin: utils.validApprovalAuth(req)
      });
    });
  });

  app.get('/memes/upload', function(req, res) {
    if (!req.session.roles.isStudent) {
      return res.redirect('/login');
    }
    res.render('memes/meme_upload', {
      authenticated: utils.isAuthenticated(req)
    });
  });

  app.post('/memes/upload', function(req, res) {
    if (!req.session.roles.isStudent) {
      return res.redirect('/login');
    }
    request({
      url: `${SERVICES_URL}/memes`,
      method: "POST",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
      },
      json: true,
      body: {
        title: req.body.title,
        url: req.body.url,
        netid: req.session.student.netid
      }
    }, function(err, response, body){
      if(err) {
        return res.status(500).send(err);
      }
      if(response.statusCode != 200 || body.error){
        req.flash('error', body.error || "Something went wrong... :'(");
      }
      else {
        req.flash('success', "Meme uploaded! Waiting on admin approval.");
      }
      res.redirect('/memes');
    });
  });

  app.get('/memes/vote/:meme_id', function(req, res) {
    if (!req.session.roles.isStudent) {
      return req.sendStatus(403);
    }
    request({
      url: `${SERVICES_URL}/memes/${req.params.meme_id}/vote`,
      method: req.query.action === 'unvote' ? 'DELETE' : 'PUT',
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN
      },
      json: true,
      body: {
        netid: req.session.student.netid
      }
    }, function(err, response, body){
      if(err || body.error) {
        return req.status(500).send(err || body.error);
      }
      return res.sendStatus(200);
    });
  });

  app.post('/memes/admin/:meme_id', function(req, res) {
    if(!req.session.roles.isStudent) {
      return req.sendStatus(403);
    }
    if(!utils.validApprovalAuth(req)) {
      req.flash('error', 'Your power level isn\'t high enough to approve memes.');
      return res.redirect('/memes');
    }
    var opts = {
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN
      },
      json: true
    };
    switch(req.query.action) {
    case 'approve':
      opts.method = "PUT";
      opts.url = `${SERVICES_URL}/memes/${req.params.meme_id}/approve`;
      opts.body = {};
      break;
    case 'reject':
      opts.method = "DELETE";
      opts.url = `${SERVICES_URL}/memes/${req.params.meme_id}`;
      break;
    default:
      return req.status(400).send("Invalid action.");
    }
    request(opts, function(err, response, body){
      if(err) return res.status(500).send(err);
      if(body.error) return res.status(500).send(body.error);
      return res.redirect('/memes');
    });
  });
};