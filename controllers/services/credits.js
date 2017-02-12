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
      if (response && response.statusCode == 200) {
        for(var t of body.transactions){
          t.created_at = moment(t.created_at)
            .format('MMMM Do YYYY, h:mm:ss a');
        }
        return res.render('credits', {
          authenticated: true,
          transactions: body.transactions,
          balance: body.balance.toFixed(2),
          messages: req.flash('success'),
          errors: req.flash('error')
        })
      }
      res.sendStatus(500);
    });
  });
  app.get('/credits/purchaseMembership', function(req, res) {
    // TODO: Redirect if not a 'pre-member'
    res.render('credits_purchase_membership', {
      authenticated: true,
      stripePublishableKey: STRIPE_PUBLISHABLE_KEY
    })
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
        return res.status(500).send(err)
      }
      if(response.statusCode != 200 || !body.successful){
        req.flash('error', "Something went wrong. Talk to someone in ACM Admin.")
        return res.redirect('/');
      }
      else {
        // TODO: Make user a paid user
        req.flash('success', "Success! Your membership fee is being processed.")
        res.redirect('/intranet')
      }
    });
  });
  app.get('/credits/addFunds', function(req, res) {
    if (!req.session.roles.isStudent) {
      return res.redirect('/intranet');
    }
    res.render('credits_add_funds', {
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
      req.flash('error', "Invalid balance adjustment amount.")
      return res.redirect('/credits');
    }
    else if(!req.body.token) {
      req.flash('error', "Payment token not found. Talk to someone in ACM Admin.")
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
        return res.status(500).send(err)
      }
      if(response.statusCode != 200 || !body.successful){
        req.flash('error', "Something went wrong. Talk to someone in ACM Admin.")
      }
      else {
        req.flash('success', "Success! Your payment is being processed.")
      }
      return res.redirect('/credits');
    });
  });
}