/**
* Copyright © 2017, ACM@UIUC
*
* This file is part of the Groot Project.  
* 
* The Groot Project is open source software, released under the University of
* Illinois/NCSA Open Source License. You should have received a copy of
* this license in a file with the distribution.
**/

const path = require("path");
require('dotenv').config({path: path.resolve(__dirname) + '/.env'});
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('client-sessions');
const utils = require('./etc/utils.js');
const flash = require('express-flash');
const winston = require('winston');
const request = require('request');
const expressWinston = require('express-winston');
const strings_for_404 = require('./etc/404_strings.json');

const PORT = process.env.PORT || 5000;
const SERVICES_URL = process.env.SERVICES_URL || 'http://localhost:8000';
const GROOT_ACCESS_TOKEN = process.env.GROOT_ACCESS_TOKEN || "TEMP_STRING";

app.set('views', path.resolve(__dirname) + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(flash());
app.use(session({
  cookieName: 'session',
  secret: process.env.SESSION_TOKEN, //used for hashing
  duration: 30*60*1000,
  activeDuration: 5*60*1000,
  httpOnly: true, // prevents browers JS from accessing cookies
  secure: true, // cookie can only be used over HTTPS
  ephemeral: true // Deletes cookie when browser closes.
}));
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console()
  ],
  meta: false, // don't log metadata about requests (produces very messy logs if true)
  expressFormat: true, // Use the default Express/morgan request formatting.
}));
app.use(function(req, res, next){ //mainly for the inital load, setting initial values for the session
  if(!req.session.roles) {
    req.session.roles = {
      isAdmin: false,
      isTop4: false,
      isCorporate: false,
      isStudent: false,
      isRecruiter: false
    };
  }
  next();
});

// reset session when user logs out
app.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect('/');
});

app.get('/', function(req, res) {
  res.render('home', {
    authenticated: utils.isAuthenticated(req),
    messages: req.flash('success'),
    errors: req.flash('error')
  });
});

app.get('/login', function(req, res) {
  if (utils.isAuthenticated(req)) {
    return res.redirect('intranet');
  }
  
  res.render('login', {
    authenticated: false,
    errors: req.flash('error')
  });
});

app.get('/conference', function(req, res) {
  res.render('conference', {
    authenticated: utils.isAuthenticated(req),
    editions: [
      { year: '2016', path: 'https://www-s.acm.illinois.edu/conference/2016' },
      { year: '2015', path: 'https://www-s.acm.illinois.edu/conference/2015' },
      { year: '2014', path: 'https://www-s.acm.illinois.edu/conference/2014' },
      { year: '2013', path: 'https://www-s.acm.illinois.edu/conference/2013' },
      { year: '2012', path: 'https://www-s.acm.illinois.edu/conference/2012' },
      { year: '2011', path: 'https://www-s.acm.illinois.edu/conference/2011' },
      { year: '2010', path: 'https://www-s.acm.illinois.edu/conference/2010' },
      { year: '2009', path: '#' },
      { year: '2008', path: 'https://www-s.acm.illinois.edu/conference/2008' },
      { year: '2007', path: 'https://www-s.acm.illinois.edu/conference/2007' },
      { year: '2006', path: 'https://www-s.acm.illinois.edu/conference/2006' },
      { year: '2005', path: '#' },
      { year: '2004', path: '#' },
      { year: '2003', path: 'https://www-s.acm.illinois.edu/conference/2003' },
      { year: '2002', path: 'https://www-s.acm.illinois.edu/conference/2002' },
      { year: '2001', path: 'https://www-s.acm.illinois.edu/conference/2001' },
      { year: '2000', path: 'https://www-s.acm.illinois.edu/conference/2000' },
      { year: '1999', path: 'https://www-s.acm.illinois.edu/conference/1999' },
      { year: '1998', path: 'https://www-s.acm.illinois.edu/conference/1998' },
      { year: '1997', path: 'https://www-s.acm.illinois.edu/conference/1997' },
      { year: '1996', path: 'https://www-s.acm.illinois.edu/conference/1996' },
      { year: '1995', path: 'https://www-s.acm.illinois.edu/conference/1995' },
    ]
  });
});

app.get('/hackillinois', function(req, res) {
  res.render('hackillinois', {
    authenticated: utils.isAuthenticated(req),
    editions: [
      { year: '2017', path: 'https://hackillinois.org' }, 
      { year: '2016', path: 'https://2016.hackillinois.org' },
      { year: '2015', path: 'https://2015.hackillinois.org' },
      { year: '2014', path: 'https://2014.hackillinois.org' },  
    ]
  });
});

app.get('/intranet', function(req, res) {
  if(!utils.isAuthenticated(req)) {
    return res.redirect('/login');
  }

  request({
    url: `${SERVICES_URL}/credits/users/${req.session.student.netid}`,
    method: "GET",
    json: true,
    headers: {
      "Authorization": GROOT_ACCESS_TOKEN
    }
  }, function(error, response, body) {
    var balance;
    if(error || response.statusCode != 200) {
      balance = 0;
    }
    else {
      balance = body.balance;
    }
    return res.render('intranet', {
      authenticated: utils.isAuthenticated(req),
      session: req.session,
      creditsBalance: balance,
      messages: req.flash('success'),
      errors: req.flash('error')
    });
  });
});

app.get('/sponsors/jobs', function(req, res) {
  res.render('new_job_post', {
    authenticated: utils.isAuthenticated(req),
    messages: req.flash('success'),
    errors: req.flash('error')
  });
});

app.get('/sponsors/login', function(req, res) {
  if(utils.isAuthenticated(req)) {
    return res.redirect('/intranet');
  }

  res.render('recruiter_login', {
    authenticated: false,
    errors: req.flash('error')
  });
});

app.get('/sponsors', function(req, res) {
  res.render('sponsors', {
    authenticated: utils.isAuthenticated(req),
  });
});

app.get('/sponsors/sponsors_list', function(req, res) {
  res.render('sponsor_list', {
    authenticated: utils.isAuthenticated(req),
  });
});

app.get('/sponsors/reset_password', function(req, res) {
  if (utils.isAuthenticated(req)) {
    return res.redirect('intranet');
  }

  res.render('reset_password', {
    authenticated: false,
    messages: req.flash('success'),
    errors: req.flash('error')
  });
});

app.get('/corporate/careerweek/2017', function(req, res) { 
  if (!utils.isAuthenticated(req)) {
    res.redirect('/sponsors/login');
  } else if (!req.session.roles.isRecruiter || (req.session.roles.isRecruiter && req.session.recruiter.is_sponsor)) {
    res.redirect('/intranet');
  }

  res.render('careerfair', {
    authenticated: true,
    recruiter: req.session.recruiter
  });
});

require('./controllers/services/events.js')(app);
require('./controllers/services/groups.js')(app);
require('./controllers/services/memes.js')(app);
require('./controllers/services/quotes.js')(app);
require('./controllers/services/recruiters.js')(app);
require('./controllers/services/users.js')(app);
require('./controllers/services/credits.js')(app);

app.use(express.static(__dirname + '/public'));
app.use('/sponsors', express.static(__dirname + '/public'));

app.use(function (req, res) {
  res.status(404).render('404', {
    message: strings_for_404[Math.floor(Math.random()*strings_for_404.length)],
    authenticated: utils.isAuthenticated(req)
  });
});

// Start server and logs port as a callback
app.listen(PORT, function() {
  console.log('GROOT_DESKTOP is live on port ' + PORT + "!"); // eslint-disable-line no-console
});
