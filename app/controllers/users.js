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
const ejs = require('ejs');
const utils = require('../../etc/utils.js');

module.exports = function(app) {
  app.get('/intranet/users', function(req, res){
    if(!req.session.roles.isAdmin && !req.session.roles.isTop4) {
      res.redirect('/login');
    }

    request({
      url: `${SERVICES_URL}/users`,
      method: "GET",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Netid": req.session.student.netid,
        "Token": req.session.student.token
      },
      json: true
    }, function(err, response, body) {
      if(err) {
        return res.status(500).send("Sorry, there was a server error. Please try again.");
      }

      res.render('users_index', {
        authenticated: utils.isAuthenticated(req),
        premembers: body.data,
        me: req.session.student
      });
    });
  });

  app.put('/intranet/users/:netid/paid', function(req, res) {
    if(!req.session.roles.isAdmin && !req.session.roles.isTop4) {
      res.redirect('/login');
    }

    var absUsersPath = path.resolve(__dirname + '/../../views/_partials/users.ejs');
    request({
      url: `${SERVICES_URL}/users/` + req.params.netid + `/paid`,
      method: "PUT",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Netid": req.session.student.netid,
        "Token": req.session.student.token  
      },
      json: true
    }, function(err, response, body) {
      if (response && response.statusCode == 200 && body) {
        res.status(200).send(ejs.render("<%- include('" + absUsersPath + "') %>", { users : body.data } ));
      } else {
        res.status(response.statusCode).send(body.error);
      }
    });
  });

  app.delete('/intranet/users/:netid', function(req, res) {
    if(!req.session.roles.isAdmin && !req.session.roles.isTop4) {
      res.redirect('/login');
    }

    var absUsersPath = path.resolve(__dirname + '/../../views/_partials/users.ejs');
    request({
      url: `${SERVICES_URL}/users/` + req.params.netid,
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
        res.status(200).send(ejs.render("<%- include('" + absUsersPath + "') %>", { users : body.data, me: req.session.student } ));
      } else {
        res.status(response.statusCode).send(body.error);
      }
    });
  });

  app.post('/join', function(req, res) {
    request({
      url: `${SERVICES_URL}/users`,
      method: "POST",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN
      },
      body: req.body,
      json: true
    }, function(err, response, body) {
      if(err || !response || response.statusCode != 200) {
        req.flash('error', (body && body.error) || err);
      } else {
        req.flash('success', body.message);
      }
      res.redirect('/join');
    });
  });

  app.post('/login', function(req, res){
    request({
      url: `${SERVICES_URL}/users/login`,
      method: "POST",
      json: true,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN
      },
      body: req.body
    }, function(err, response, body) {
      if(err || !response || response.statusCode != 200) {
        req.flash('error', (body && body.error) || err);
        res.redirect('/login');
      } else {
        req.session.student = {
          first_name: body.data.first_name,
          last_name: body.data.last_name,
          token: body.data.token,
          netid: body.data.netid
        };
        req.session.username = req.session.student.first_name;
        req.session.roles.isStudent = true;

        utils.setAuthentication(req, res, function(req, res) {
          res.redirect('/intranet');
        });
      }
    });
  });
};
