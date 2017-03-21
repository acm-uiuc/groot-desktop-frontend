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
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || "TEMP_STRING";
const request = require('request');
const moment = require('moment');

function makeUserPaid(req, res, nextSteps) {
  request({
    method:"GET",
    url: `${SERVICES_URL}/users/${req.session.student.netid}/paid`,
    headers: {
      "Authorization": GROOT_ACCESS_TOKEN
    }
  }, function(error) {
    if(error) {
      req.flash('error', "Unable to make user a paid user. Talk to someone in ACM Admin.");
      return req.redirect("/");
    }
    nextSteps(req, res);
  });
}

module.exports = function(app){
  app.get('/credits', function(req, res) {
    if (!req.session.roles.isStudent) {
      return res.redirect('/intranet');
    }

    request({
      url: `${SERVICES_URL}/credits/transactions`,
      method: "GET",
      json: true,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN
      },
      qs: {
        netid: req.session.student.netid
      }
    }, function(error, response, body) {
      if (response && response.statusCode == 200 && body.transactions) {
        for(var t of body.transactions){
          t.created_at = moment(t.created_at)
            .format('MMMM Do YYYY, h:mm:ss a');
        }
        return res.render('credits/credits', {
          authenticated: true,
          transactions: body.transactions,
          balance: body.balance.toFixed(2),
          messages: req.flash('success'),
          errors: req.flash('error')
        });
      }
      res.sendStatus(500);
    });
  });
  app.get('/credits/admin', function(req, res) {
    if (!req.session.roles.isAdmin) {
      return res.redirect('/intranet');
    }
    request({
      url: `${SERVICES_URL}/credits/users`,
      method: "GET",
      json: true,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN
      }
    }, function(error, response, body) {
      if (response && response.statusCode == 200) {
        return res.render('credits/credits_admin', {
          authenticated: true,
          users: body
        });
      }
      res.sendStatus(500);
    });
  });
  app.get('/credits/admin/:netid', function(req, res) {
    if (!req.session.roles.isAdmin) {
      return res.redirect('/intranet');
    }
    request({
      url: `${SERVICES_URL}/credits/transactions`,
      method: "GET",
      json: true,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN
      },
      qs: {
        netid: req.params.netid
      }
    }, function(error, response, body) {
      if (response && response.statusCode == 200 && body.transactions) {
        for(var t of body.transactions){
          t.created_at = moment(t.created_at)
            .format('MMMM Do YYYY, h:mm:ss a');
        }
        return res.render('credits/credits_admin_user', {
          authenticated: true,
          transactions: body.transactions,
          balance: body.balance,
          netid: req.params.netid
        });
      }
      req.flash('error', 'Something went wrong.')
      return res.redirect('/credits')
    });
  });
  app.post('/credits/admin/:netid', function(req, res) {
    if (!req.session.roles.isAdmin) {
      return res.redirect('/intranet');
    }
    request({
      url: `${SERVICES_URL}/credits/transactions`,
      method: "POST",
      json: true,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Credits-Token": req.session.student.token
      },
      body: {
        description: "Balance adjustment by " + req.session.student.netid,
        amount: req.body.amount,
        netid: req.params.netid
      }
    }, function(error, response) {
      if (response && response.statusCode == 200) {
        return res.redirect('/credits/admin/' + req.params.netid);
      }
      res.sendStatus(500);
    });
  });
  app.delete('/credits/admin/transactions/:id', function(req, res) {
    if (!req.session.roles.isAdmin) {
      return res.redirect('/intranet');
    }
    request({
      url: `${SERVICES_URL}/credits/transactions/${req.params.id}`,
      method: "DELETE",
      json: true,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Credits-Token": req.session.student.token
      }
    }, function(error, response) {
      if (response && response.statusCode == 200) {
        return res.sendStatus(200);
      }
      res.sendStatus(500);
    });
  });
  app.get('/credits/purchaseMembership', function(req, res) {
    // TODO: Redirect if not a 'pre-member'
    res.render('credits/credits_purchase_membership', {
      authenticated: true,
      stripePublishableKey: STRIPE_PUBLISHABLE_KEY
    });
  });
  app.post('/credits/purchaseMembership', function(req, res) {
    // TODO: Redirect if not a 'pre-member'

    // Sanity checks
    if(!req.body.stripeToken) {
      return res.sendStatus(500);
    }
    // Send payment details to groot-credits-service for processing
    request({
      url: `${SERVICES_URL}/payment`,
      method: "POST",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
      },
      json: true,
      body: {
        netid: req.session.student.netid,
        amount: 4150, // Membership fee + Stripe processing fee
        token: req.body.stripeToken,
        description: "Membership purchase",
        adjust_balance: false // Don't give the user credit for this transaction
      }
    }, function(err, response, body){
      if(err) {
        return res.status(500).send(err);
      }
      if(response.statusCode != 200 || !body.successful){
        req.flash('error', "Something went wrong with your payment. Talk to someone in ACM Admin.");
        return res.redirect('/');
      }
      else {
        // Make user a paid user
        makeUserPaid(req, res, function() {
          req.flash('success', "Success! Your membership fee is being processed.");
          res.redirect('/intranet');
        });
      }
    });
  });
  app.get('/credits/addFunds', function(req, res) {
    if (!req.session.roles.isStudent) {
      return res.redirect('/intranet');
    }
    res.render('credits/credits_add_funds', {
      authenticated: true,
      stripePublishableKey: STRIPE_PUBLISHABLE_KEY
    });
  });
  app.post('/credits/addFunds', function(req, res) {
    if (!req.session.roles.isStudent) {
      return res.redirect('/login');
    }
    // Sanity checks
    if(req.body.amount < 5 || req.body.amount > 50) {
      req.flash('error', "Invalid balance adjustment amount.");
      return res.redirect('/credits');
    }
    else if(!req.body.token) {
      req.flash('error', "Payment token not found. Talk to someone in ACM Admin.");
      return res.redirect('/credits');
    }
    // Send payment details to groot-credits-service for processing
    request({
      url: `${SERVICES_URL}/payment`,
      method: "POST",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
      },
      json: true,
      body: {
        netid: req.session.student.netid,
        amount: req.body.amount,
        token: req.body.token,
        description: "Balance refill"
      }
    }, function(err, response, body){
      if(err) {
        return res.status(500).send(err);
      }
      if(response.statusCode != 200 || !body.successful){
        req.flash('error', "Something went wrong. Talk to someone in ACM Admin.");
      }
      else {
        req.flash('success', "Success! Your payment is being processed.");
      }
      return res.redirect('/credits');
    });
  });
};