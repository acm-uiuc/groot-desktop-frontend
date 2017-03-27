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
  app.get('/intranet/merch/items', function(req, res) {
    if(!req.session.roles.isAdmin && !req.session.roles.isTop4 && !req.session.roles.isCorporate) {
      res.redirect('/intranet');
    }

    request({
      url: `${SERVICES_URL}/merch/locations`,
      method: "GET",
      json: true,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN
      }
    }, function(error, response, body) {
      res.render('merch/index.ejs', {
        authenticated: utils.isAuthenticated(req),
        locations: body.data,
        success: req.flash('success'),
        errors: req.flash('error')
      });
    });
  });

  app.post('/intranet/merch/items', function(req, res) {
    if(!req.session.roles.isAdmin && !req.session.roles.isTop4 && !req.session.roles.isCorporate) {
      res.redirect('/intranet');
    }

    request({
      url: `${SERVICES_URL}/merch/items`,
      method: "POST",
      json: true,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN
      },
      body: req.body
    }, function(error, response, body) {
      if (error || !response) {
        return res.status(500).send('Error: ' + error);
      }

      if (response.statusCode === 200) {
        req.flash('success', body.message);
      } else {
        req.flash('error', body.error);
      }
      
      res.redirect('/intranet/merch/items');
    });
  });

  app.get('/intranet/merch/items/:location/new', function(req, res) {
    if(!req.session.roles.isAdmin && !req.session.roles.isTop4) {
      res.redirect('/intranet');
    }

    // TODO check if unoccupied first
    res.render('merch/edit.ejs', {
      authenticated: utils.isAuthenticated(req),
      item: { // New Item Defaults
        'name': '',
        'price': 1,
        'image': '',
        'quantity': 5
      },
      location: req.params.location,
      success: req.flash('success'),
      errors: req.flash('error')
    });
  });

  app.get('/intranet/merch/items/:id/:location/edit', function(req, res) {
    if(!req.session.roles.isAdmin && !req.session.roles.isTop4) {
      res.redirect('/intranet');
    }

    request({
      url: `${SERVICES_URL}/merch/items/` + req.params.id,
      method: "GET",
      json: true,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN
      }
    }, function(error, response, body) {
      // TODO check if location has that item already
      res.render('merch/edit.ejs', {
        authenticated: utils.isAuthenticated(req),
        item: body.data,
        location: req.params.location,
        success: req.flash('success'),
        errors: req.flash('error')
      });
    });
  });

  app.post('/intranet/merch/items/:id', function(req, res) {
    if(!req.session.roles.isAdmin && !req.session.roles.isTop4 && !req.session.roles.isCorporate) {
      res.redirect('/intranet');
    }

    request({
      url: `${SERVICES_URL}/merch/items/` + req.params.id,
      method: "PUT", // TODO make post or put depending on something
      json: true,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN
      },
      body: req.body
    }, function(error, response, body) {
      if (response.statusCode == 200) {
        req.flash('success', body.message);
        return res.redirect('/intranet/merch/items');
      } else {
        req.flash('error', body.error);
        return res.redirect('/intranet/merch/items/' + req.params.id);
      }
    });
  });

  app.delete('/intranet/merch/items/:id', function(req, res) {
    if(!req.session.roles.isAdmin && !req.session.roles.isTop4 && !req.session.roles.isCorporate) {
      res.redirect('/intranet');
    }
    
    request({
      url: `${SERVICES_URL}/merch/items/` + req.params.id,
      method: "DELETE",
      json: true,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN
      }
    }, function(error, response, body) {
      if (response.statusCode == 200) {
        req.flash('success', body.message);
        res.status(200).send("");
      } else {
        req.flash('error', body.error);
        res.status(500).send("Error " + body.error);
      }
    });
  });
};