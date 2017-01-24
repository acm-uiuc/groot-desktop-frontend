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
const express = require('express');
const ejs = require('ejs');
const moment = require('moment');
const app = express();
const bodyParser = require('body-parser');
const session = require('client-sessions');
const request = require('request');
const utils = require('./etc/utils.js');
const flash = require('express-flash');
const nodemailer = require('nodemailer');
const winston = require('winston');
const expressWinston = require('express-winston');

// require('request-debug')(request); // for debugging of outbound requests

require('dotenv').config({path: path.resolve(__dirname) + '/.env'});
const PORT = process.env.PORT || 5000;
const SERVICES_URL = process.env.SERVICES_URL || 'http://localhost:8000';
const GROOT_ACCESS_TOKEN = process.env.GROOT_ACCESS_TOKEN || "TEMP_STRING";
const smtpConfig = {
	host: 'express-smtp.cites.uiuc.edu',
	port: 25,
	secure: false,
	ignoreTLS: true,
};
const transporter = nodemailer.createTransport(smtpConfig);

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

app.post('/login', function(req, res){
	var netid = req.body.netid, pass = req.body.password;
	var options = {
		url: `${SERVICES_URL}/session?username=${netid}`,
		method: "POST",
		json: true,
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN
		},
		body: {
			"username" : netid,
			"password" : pass,
			"validation-factors" : {
				"validationFactors" : [{
					"name" : "remote_address",
					"value" : "127.0.0.1"
				}]
			}
		}
	};

	function callback(error, response, body) {
		if(!body || !body["token"]) {
			return res.render('login', {
				authenticated: false,
				errors: 'Invalid email or password.'
			});
		}
		
		if (!error && response && response.statusCode == 200) {
			req.session.student = {
				netid: netid,
				token: body["token"],
				email: netid + "@illinois.edu"
			};
			req.session.roles.isStudent = true;

			setAuthentication(req, res, function(req, res) {
				getUserData(req, res, function(req, res){
					res.redirect('/intranet');
				});
			});
		} else {
			res.status(response.statusCode).send(error);
		}
	}
	request(options, callback);
});

app.post('/sponsors/login', function(req, res) {
	request({
		url: `${SERVICES_URL}/recruiters/login`,
		method: "POST",
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN
		},
		json: true,
		body: req.body
	}, function(err, response, body) {
		if (!err && response && response.statusCode == 200) {
			// Contains JWT token
			req.session.recruiter = body.data;

			req.session.username = body.data.first_name;
			req.session.roles.isRecruiter = true;
			
			return res.redirect('/intranet');
		}
		res.render('recruiter_login', {
			authenticated: false,
			errors: body.error
		});
	});
});

app.get('/sponsors/reset_password', function(req, res) {
	if (isAuthenticated(req)) {
		return res.redirect('intranet');
	}

	res.render('reset_password', {
		authenticated: false,
		messages: req.flash('success'),
		errors: req.flash('error')
	});
});

app.post('/sponsors/reset_password', function(req, res) {
	if (isAuthenticated(req)) {
		return res.redirect('intranet');
	}

	// To send to recruiters service to send an email from the appropriate account
	var payload = req.body;
	payload["email"] = "corporate@acm.illinois.edu";

	request({
		url: `${SERVICES_URL}/recruiters/reset_password`,
		method: "POST",
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN
		},
		json: true,
		body: payload
	}, function(error, response, body) {
		if (response.statusCode != 200 || body.error) {
			req.flash('error', body.error || "Something went wrong...")
		}
		else {
			req.flash('success', body.message);
		}
		res.redirect('/sponsors/reset_password');
	});
});

function isAuthenticated(req) {
	return req.session.roles.isStudent || req.session.roles.isRecruiter;
}

function setAuthentication(req, res, nextSteps) {
	var netid = req.session.student.netid;
	if (!netid) {
		nextSteps(req, res);
		return;
	}

	checkIfAdmin(req, res, function(req, res) {
		checkIfTop4(req, res, function(req, res) { 
			checkIfCorporate(req, res, function(req, res) {
				nextSteps(req, res);
			});
		});
	});
}

function checkIfAdmin(req, res, nextSteps) {
	var netid = req.session.student.netid;
	request({
		method:"GET",
		url: `${SERVICES_URL}/groups/committees/admin?isMember=${netid}`,
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN
		}
	}, function(error, response, body) {
		if(response && response.statusCode == 200) {
			req.session.roles.isAdmin = (JSON.parse(body).isValid);
		}		
		nextSteps(req, res);
	});
}

function checkIfCorporate(req, res, nextSteps) {
	var netid = req.session.student.netid;

	request({
		method:"GET",
		url: `${SERVICES_URL}/groups/committees/corporate?isMember=${netid}`,
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN
		}
	}, function(error, response, body) {
		if(response && response.statusCode == 200) {
			req.session.roles.isCorporate = (JSON.parse(body).isValid);
		}		
		nextSteps(req, res);
	});
}

function checkIfTop4(req, res, nextSteps) {
	var netid = req.session.student.netid;

	request({
		method:"GET",
		url: `${SERVICES_URL}/groups/committees/Top4?isMember=${netid}`,
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN
		}
	}, function(error, response, body) {
		if(response && response.statusCode == 200) {
			req.session.roles.isTop4 = (JSON.parse(body).isValid);
		}		
		nextSteps(req, res);
	});
}

function getUserData(req, res, nextSteps){
	var netid = req.body.netid;
	request({
		url: `${SERVICES_URL}/users/${netid}`,
		method: "POST",
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN
		},
		body: {
			"token" : req.session.student.token,
		},
		json: true
	}, function(error, response, body) {
		if(body && body[0] != undefined) {
			req.session.student.firstName = body[0].first_name;
			req.session.student.lastName = body[0].last_name;
			req.session.username = req.session.student.firstName;
		}
		nextSteps(req, res);
	});
}

function validApprovalAuth(req) {
	return (req.session.roles.isAdmin || req.session.roles.isCorporate || req.session.roles.isTop4);
}

// reset session when user logs out
app.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect('/');
});

/*********************************************************************/

var sponsorsScope = {
	job: {
		jobType: null,
		types: [{
			name: 'Internship'
		}, {
			name: 'Co-Op'
		}, {
			name: 'Full Time'
		}],
	},
	degree: {
		degreeType: null,
		types: [{
			name: 'Bachelors'
		}, {
			name: 'Masters'
		}, {
			name: 'Ph.D'
		}],
	},
	grad: {
		gradYear: null,
		years: [],
	},
	student: null,
	recruiter: {
		types: [{
			name: 'Sponsor',
		}, {
			name: 'Jobfair',
		}, {
			name: 'Startup'
		}, {
			name: 'Outreach'
		}],
	}
};

var d = new Date();
var y = d.getFullYear();
var m = d.getMonth();
var dec = "December ";
var may = "May ";

if (m > 6) {
	for (var i = 0; i < 4; i++) {
		sponsorsScope.grad.years.push({
			date: dec + y
		});
		sponsorsScope.grad.years.push({
			date: may + y
		});
		y++;
	}
} else {
	for (var i = 0; i < 4; i++) {
		sponsorsScope.grad.years.push({
			date: may + y
		});
		sponsorsScope.grad.years.push({
			date: dec + y
		});
		y++;
	}
}

app.get('/', function(req, res) {
	res.render('home', {
		authenticated: isAuthenticated(req),
	});
});

app.get('/login', function(req, res) {
	if (isAuthenticated(req)) {
		return res.redirect('intranet');
	}
	
	res.render('login', {
		authenticated: false,
		errors: req.flash('error')
	});
});

app.get('/about', function(req, res) {
	request({
		url: `${SERVICES_URL}/groups/committees`,
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN
		},
		method: "GET"
  }, function(err, response, body) {
	if (err) {
		return res.status(404).send("Error:\nThis page will be implemented soon!");
	}

	res.render('about', {
		authenticated: isAuthenticated(req),
		committees: JSON.parse(body),
	});
  });
});

app.get('/conference', function(req, res) {
	res.render('conference', {
		authenticated: isAuthenticated(req),
		editions: [
			{ year: '2016', path: '/conference/2016' },
			{ year: '2015', path: '/conference/2015' },
			{ year: '2014', path: '/conference/2014' },
			{ year: '2013', path: '/conference/2013' },
			{ year: '2012', path: '/conference/2012' },
			// { year: '2011', path: '/conference/2011' },
			{ year: '2010', path: '/conference/2010' },
			// { year: '2009', path: '/conference/2009' },
			{ year: '2008', path: '/conference/2008' },
			{ year: '2007', path: '/conference/2007' },
			{ year: '2006', path: '/conference/2006' },
			// { year: '2005', path: '/conference/2005' },
			// { year: '2004', path: '/conference/2004' },
			{ year: '2003', path: '/conference/2003' },
			{ year: '2002', path: '/conference/2002' },
			{ year: '2001', path: '/conference/2001' },
			{ year: '2000', path: '/conference/2000' },
			{ year: '1999', path: '/conference/1999' },
			{ year: '1998', path: '/conference/1998' },
			{ year: '1997', path: '/conference/1997' },
			{ year: '1996', path: '/conference/1996' },
			{ year: '1995', path: '/conference/1995' },
		]
	})
});

app.get('/hackillinois', function(req, res) {
	res.render('hackillinois', {
		authenticated: isAuthenticated(req),
		editions: [
			{ year: '2017', path: 'https://hackillinois.org' },	
			{ year: '2016', path: 'https://2016.hackillinois.org' },
			{ year: '2015', path: 'https://2015.hackillinois.org' },
			{ year: '2014', path: 'https://2014.hackillinois.org' },	
		]
	});
});

app.get('/intranet', function(req, res) {
	if(!isAuthenticated(req)) {
		return res.redirect('/login');
	}
	
	res.render('intranet', {
		authenticated: isAuthenticated(req),
		session: req.session
	});
});

app.get('/intranet/users', function(req, res){
	if(!req.session.roles.isAdmin && !req.session.roles.isTop4) {
		res.redirect('/login');
	}

	request({
		url: `${SERVICES_URL}/users/pre`,
		method: "POST",
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN
		},
		body: {
			"token": req.session.student.token,
		},
		json: true
	}, function(err, response, body) {
		if(err) {
			console.log(err);
			return res.status(500).send("Sorry, there was a server error.  Please try again.");
		}
		res.render('users_index', {
			authenticated: isAuthenticated(req),
			session:req.session,
			premembers: body,
			messages: req.flash('success')
		});
	});

});


app.get('/intranet/users/:approvedUserNetID', function(req, res){
	if(!req.session.roles.isAdmin && !req.session.roles.isTop4) {
		return res.redirect('/login');
	}

	request({
		url: `${SERVICES_URL}/users/paid`,
		method: "POST",
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN
		},
		body: {
			"token" : req.session.student.token,
			"netid" : req.params["approvedUserNetID"],
		},
		json: true
	}, function(err, response, body) {
		if(err) {
			req.flash('error', "There was an issue, and the member may not have been added. Please contact someone from the Admin committee.");
		} else {
			req.flash('success', "The member was added successfully!");
		}

		res.redirect('/intranet/users');
	});
});

app.post('/join', function(req, res) {
    var userData = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        netid: req.body.netid,
        uin: req.body.uin
    };
    request({
        url: `${SERVICES_URL}/users/newUser`,
        method: "POST",
        headers: {
			"Authorization": GROOT_ACCESS_TOKEN
		},
        body: userData,
        json: true
    }, function(err, response, body) {
	if(err || !response || response.statusCode != 200) {
		req.flash('error', err || body.error);
	} else {
		req.flash('success', "Added as a premember");
	}
	res.redirect('/join');
    });
});

app.get('/join', function(req, res) {
	if(isAuthenticated(req)) {
		return res.redirect('/intranet');
	}

	request({
		url: `${SERVICES_URL}/groups/sigs`,
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN
		},
		method: "GET",
	}, function(err, response, body) {
		if (err || !response || response.statusCode != 200) {
			return res.status(500).send(err);
		}
		res.render('join', {
			authenticated: false,
			sigs: JSON.parse(body),
			messages: req.flash('success'),
			errors: req.flash('error')
		});
	});
});

app.get('/sigs', function(req, res) {
    request({
        url: `${SERVICES_URL}/groups/sigs`,
	headers: {
		"Authorization": GROOT_ACCESS_TOKEN
	},
        method: "GET",
    }, function(err, response, body) {
        if (err || !response || !response.statusCode) {
            return res.status(500).send(err);
        }

        sigs = JSON.parse(body);
		sigs_a = sigs.slice(0, (sigs.length / 2) + 1);
        sigs_b = sigs.slice(sigs.length / 2 + 1, sigs.length);
        res.render('sigs', {
            authenticated: isAuthenticated(req),
            sig_col_a: sigs_a,
            sig_col_b: sigs_b,
        });
    });
});

app.get('/sponsors/jobs', function(req, res) {
	res.render('new_job_post', {
		authenticated: isAuthenticated(req),
		messages: req.flash('success'),
		errors: req.flash('error')
	});
});

app.post('/sponsors/jobs', function(req, res) {
	request({
		url: `${SERVICES_URL}/jobs`,
		method: "POST",
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN
		},
		json: true,
		body: req.body
	}, function(err, response, body) {
		if (response.statusCode != 200 || body.error) {
			req.flash('error', body.error || "An unexpected error occurred");
		}
		else {
			req.flash('success', body.message);
		}
		res.redirect('/sponsors/jobs');
	});
});

app.get('/jobs', function(req, res) {
	if (!isAuthenticated(req)) {
		res.redirect('/login');
	}

	request({
		url: `${SERVICES_URL}/jobs`,
		method: "GET",
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN,
			"Netid": req.session.student.netid,
			"Token": req.session.student.token
		},
		json: true,
		qs: {
			approved: true
		}
	}, function(error, response, body) {
		res.render('job_index', {
			authenticated: true,
			jobs: body.data
		});
	});
});

app.get('/corporate/manage', function(req, res) {
	if (!req.session.roles.isCorporate) {
		return res.redirect('/login');
	}

	request({
		url: `${SERVICES_URL}/jobs?approved=false`,
		method: "GET",
		json: true,
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN
		}
	}, function(error, response, body) {
		if (error || !response || response.statusCode != 200) {
			return res.status(500).send("Error: " + error);
		}
		
		request({
			url: `${SERVICES_URL}/students?approved_resumes=false`,
			method: "GET",
			json: true,
			headers: {
				"Authorization": GROOT_ACCESS_TOKEN,
				"Netid": req.session.student.netid,
				"Token": req.session.student.token
			}
		}, function(s_error, s_response, s_body) {
			if (s_response && s_response.statusCode == 200 && s_body && body) {
				res.render('corporate_manager', {
					unapproved_resumes: s_body.data,
					job_listings: body.data,
					authenticated: true,
					dates: {
						"one day": moment().subtract('1', 'days').format("YYYY-MM-DD"),
						"one week": moment().subtract('1', 'weeks').format("YYYY-MM-DD"),
						"one month": moment().subtract('1', 'months').format("YYYY-MM-DD"),
						"three months": moment().subtract('3', 'months').format("YYYY-MM-DD"),
						"six months": moment().subtract('6', 'months').format("YYYY-MM-DD"),
						"one year": moment().subtract('1', 'years').format("YYYY-MM-DD")
					},
					dates_default: "three months"
				});
			} else {
				res.status(500).send(s_error);
			}
		});
	});
});

app.get('/corporate/students/:date', function(req, res) {
	if (!req.session.roles.isCorporate) {
		return res.redirect('/intranet');
	}

	request({
		url: `${SERVICES_URL}/students`,
		method: "GET",
		json: true,
		qs: {
			last_updated_at: req.params.date
		},
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN,
			"Netid": req.session.student.netid,
			"Token": req.session.student.token
		},
		body: req.body
	}, function(error, response, body) {
		if (!response || error) {
			return res.status(500).send(error);
		}
		res.status(response.statusCode).send(body);
	});
});

app.get('/corporate/accounts', function(req, res) {
	if (!req.session.roles.isCorporate) {
		res.redirect('/intranet');
	}

	request({
		url: `${SERVICES_URL}/recruiters`,
		method: "GET",
		json: true,
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN,
			"Netid": req.session.student.netid,
			"Token": req.session.student.token
		},
	}, function(error, response, body) {
		if (!error && response && response.statusCode == 200 && body) {
			res.render('account_manager', {
				recruiters: body.data,
				authenticated: true,
				recruiter_types: sponsorsScope.recruiter,
				errors: req.flash('error'),
				messages: req.flash('success')
			});
		} else {
			res.status(500).send(body);
		}
	});
});

app.post('/corporate/accounts', function(req, res) {
	if (!req.session.roles.isCorporate) {
		res.redirect('/intranet');
	}

	var payload = req.body;
	payload["email"] = "corporate@acm.illinois.edu";

	request({
		url: `${SERVICES_URL}/recruiters`,
		method: "POST",
		json: true,
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN,
			"Netid": req.session.student.netid,
			"Token": req.session.student.token
		},
		body: payload
	}, function(error, response, body) {
		if (body && body.error == null) {
			req.flash('success', body.message);
			return res.redirect('/corporate/accounts');
		} else if (body && body.message == null) {
			req.flash('error', body.error || 'An unexpected error occurred');
			return res.redirect('/corporate/accounts/' + req.params.recruiterId + '/invite');
		}

		return res.redirect('/corporate/accounts');
	});
});

app.get('/corporate/accounts/:recruiterId/invite', function(req, res) {
	if (!req.session.roles.isCorporate) {
		return res.redirect('/intranet');
	}

	request({
		url: `${SERVICES_URL}/recruiters/` + req.params.recruiterId + `/invite`,
		method: "GET",
		json: true,
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN,
			"Netid": req.session.student.netid,
			"Token": req.session.student.token
		},
		qs: {
			username: req.session.username
		}
	}, function(error, response, body) {
		if (response.statusCode != 200) {
			res.status(response.statusCode).send(body.error);
		} else if (body.data == null || body.data.recruiter == null || body.data.recruiter.invited) {
			return res.redirect('/corporate/accounts');
		}

		res.render('recruiter_invite', {
			authenticated: true,
			emailTemplate: body.data,
			from_email: req.session.student.email,
			recruiter: body.data.recruiter,
			errors: req.flash('error')
		});
	});
});

app.post('/corporate/accounts/:recruiterId/invite', function(req, res) {
	if (!req.session.roles.isCorporate) {
		return res.redirect('/intranet');
	}

	var payload = req.body;
	payload["email"] = req.session.student.email;

	request({
		url: `${SERVICES_URL}/recruiters/` + req.params.recruiterId + `/invite`,
		method: "POST",
		json: true,
		body: payload,
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN,
			"Netid": req.session.student.netid,
			"Token": req.session.student.token
		},
	}, function(error, response, body) {
		if (body && body.error == null) {
			req.flash('success', body.message);
			return res.redirect('/corporate/accounts');
		} else if (body && body.message == null) {
			req.flash('error', body.error || 'An unexpected error occurred');
			return res.redirect('/corporate/accounts/' + req.params.recruiterId + '/invite');
		}

		return res.redirect('/corporate/accounts');
	});
});

app.put('/corporate/students/:netid/approve', function(req, res) {
	if (!req.session.roles.isCorporate) {
		return res.redirect('/intranet');
	}

	var absResumePath = path.resolve(__dirname) + '/views/_partials/unapproved_resumes.ejs';
	request({
		url: `${SERVICES_URL}/students/` + req.params.netid + `/approve`,
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
			res.status(200).send(ejs.render("<%- include('" + absResumePath + "') %>", { unapproved_resumes : body.data } ));
		} else {
			res.status(response.statusCode).send(body.error);
		}
	});
});

app.delete('/corporate/students/:netid', function(req, res) {
	if (!req.session.roles.isCorporate) {
		return res.redirect('/intranet');
	}

	var absResumePath = path.resolve(__dirname) + '/views/_partials/unapproved_resumes.ejs';
	request({
		url: `${SERVICES_URL}/students/` + req.params.netid,
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
			res.status(200).send(ejs.render("<%- include('" + absResumePath + "') %>", { unapproved_resumes : body.data } ));
		} else {
			res.status(response.statusCode).send(body.error);
		}
	});
});

app.put('/corporate/jobs/:jobId/approve', function(req, res) {
	if (!req.session.roles.isCorporate) {
		res.redirect('/intranet');
	}
	
	var absJobPath = path.resolve(__dirname) + '/views/_partials/unapproved_jobs.ejs';
	request({
		url: `${SERVICES_URL}/jobs/` + req.params.jobId + `/approve`,
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
			res.status(200).send(ejs.render("<%- include('" + absJobPath + "') %>", { job_listings : body.data } ));
		} else {
			res.status(response.statusCode).send(body.error);
		}
	});
});

app.delete('/corporate/jobs/:jobId', function(req, res) {
	if (!req.session.roles.isCorporate) {
		return res.redirect('/intranet');
	}

	var absJobPath = path.resolve(__dirname) + '/views/_partials/unapproved_jobs.ejs';
	request({
		url: `${SERVICES_URL}/jobs/` + req.params.jobId,
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
			res.status(200).send(ejs.render("<%- include('" + absJobPath + "') %>", { job_listings : body.data } ));
		} else {
			res.status(response.statusCode).send(body.error);
		}
	});
});

app.get('/corporate/accounts/:recruiterId', function(req, res) {
	if (!req.session.roles.isCorporate) {
		return res.redirect('/intranet');
	}

	request({
		url: `${SERVICES_URL}/recruiters/` + req.params.recruiterId,
		method: "GET",
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN,
			"Netid": req.session.student.netid,
			"Token": req.session.student.token  
		},
		json: true
	}, function(error, response, body) {
		if (response && response.statusCode == 200 && body) {
			res.render('edit_recruiter', {
				authenticated: true,
				recruiter: body.data,
				recruiter_types: sponsorsScope.recruiter,
				errors: req.flash('error')
			});
		} else {
			res.status(response.statusCode).send(body.error);
		}
	});
});

app.post('/corporate/accounts/reset', function(req, res) {
	if (!req.session.roles.isCorporate) {
		res.redirect('/intranet');
	}

	request({
		url: `${SERVICES_URL}/recruiters/reset`,
		method: "POST",
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN,
			"Netid": req.session.student.netid,
			"Token": req.session.student.token  
		},
		json: true,
		body: {}
	}, function(error, response, body) {
		if (!body.error && body.message) {
			req.flash('success', body.message);
		} else if (body.error && !body.message) {
			req.flash('error', body.error);
		}

		res.redirect('/corporate/accounts');
	});
});

app.post('/corporate/accounts/:recruiterId', function(req, res) {
	if (!req.session.roles.isCorporate) {
		res.redirect('/intranet');
	}

	request({
		url: `${SERVICES_URL}/recruiters/` + req.params.recruiterId,
		method: "PUT",
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN,
			"Netid": req.session.student.netid,
			"Token": req.session.student.token  
		},
		json: true,
		body: req.body
	}, function(error, response, body) {
		if (body.error == null && body.message != null) {
			req.flash('success', body.message);
			return res.redirect('/corporate/accounts');
		}
		
		res.render('edit_recruiter', {
			authenticated: true,
			recruiter: req.body,
			recruiter_types: sponsorsScope.recruiter,
			errors: body.error
		});
	});
});

app.put('/corporate/accounts/:recruiterId/renew', function(req, res) {
	if (!req.session.roles.isCorporate) {
		return res.redirect('/intranet');
	}

	var absRecruiterPath = path.resolve(__dirname) + '/views/_partials/recruiters.ejs';
	request({
		url: `${SERVICES_URL}/recruiters/` + req.params.recruiterId + `/renew`,
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
			res.status(200).send(ejs.render("<%- include('" + absRecruiterPath + "') %>", { recruiters : body.data } ));
		} else {
			res.status(response.statusCode).send(body.error);
		}
	});
});

app.delete('/corporate/accounts/:recruiterId', function(req, res) {
	if (!req.session.roles.isCorporate) {
		return res.redirect('/intranet');
	}

	var absRecruiterPath = path.resolve(__dirname) + '/views/_partials/recruiters.ejs';
	request({
		url: `${SERVICES_URL}/recruiters/` + req.params.recruiterId,
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
			res.status(200).send(ejs.render("<%- include('" + absRecruiterPath + "') %>", { recruiters : body.data } ));
		} else {
			res.status(response.statusCode).send(body.error);
		}
	});
});

app.post('/corporate/students/remind', function(req, res) {
	if (!req.session.roles.isCorporate) {
		return res.redirect('/intranet');
	}

	request({
		url: `${SERVICES_URL}/students/remind`,
		method: "POST",
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN,
			"Netid": req.session.student.netid,
			"Token": req.session.student.token  
		},
		body: {
			last_updated_at: req.body.lastUpdatedAt
		},
		json: true
	}, function(error, response, body) {
		if (!body.error && body.message) {
			req.flash('success', body.message);
		} else if (body.error && !body.message) {
			req.flash('error', body.error);
		}

		res.redirect('/corporate/students/remind');
	});
});

app.get('/sponsors/login', function(req, res) {
	if(isAuthenticated(req)) {
		return res.redirect('/intranet');
	}

	res.render('recruiter_login', {
		authenticated: false,
		errors: req.flash('error')
	});
});

app.get('/resumes/new', function(req, res) {
	if (req.session.roles.isStudent) {
		request({
			url: `${SERVICES_URL}/students/` + req.session.student.netid,
			method: "GET",
			json: true,
			body: {}
		}, function(error, response, body) {
			if (body && body.data) {
				// Format graduation date into same format as how it should be displayed
				body.data.graduation_date = moment(body.data.graduation_date).format('MMMM YYYY');
				sponsorsScope.student = body.data;
			}
			var error_message;
			if (response && response.statusCode != 200) {
				error_message = (body && body.error) ? body.error : error;
			}

			return res.render('resume_book', {
				authenticated: isAuthenticated(req),
				job: sponsorsScope.job,
				degree: sponsorsScope.degree,
				grad: sponsorsScope.grad,
				student: sponsorsScope.student,
				success: null,
				error: error_message
			});
		});
	}

	sponsorsScope.student = {};
	return res.render('resume_book', {
		authenticated: isAuthenticated(req),
		job: sponsorsScope.job,
		degree: sponsorsScope.degree,
		grad: sponsorsScope.grad,
		student: sponsorsScope.student,
		success: req.flash('success'),
		error: req.flash('error')
	});
});

app.post('/resumes/new', function(req, res) {
    request({
        url: `${SERVICES_URL}/students`,
        method: "POST",
        headers: {
            "Authorization": GROOT_ACCESS_TOKEN
        },
        json: true,
        body: req.body
    }, function(err, response, body) {
			// Because the resume needed to be serialized, this should return json instead (to serialize_resume.js).
			res.status(response.statusCode).send(body);
    });
});

app.get('/corporate/resumes', function(req, res) {
	if(!(req.session.roles.isCorporate || req.session.roles.isRecruiter)) {
		res.redirect('/sponsors/login');
	}

	var headers = {
		"Authorization": GROOT_ACCESS_TOKEN
	};

	if (req.session.roles.isRecruiter) {
		headers["RECRUITER_TOKEN"] = req.session.recruiter.token;
	} else {
		headers["Netid"] = req.session.student.netid;
		headers["Token"] = req.session.student.token;
	}

	request({
		url: `${SERVICES_URL}/students`,
		method: "GET",
		json: true,
		headers: headers
	}, function(error, response, body) {
		if (response && response.statusCode == 200) {
			for (var resume of body.data) {
				resume.graduation_date = utils.formatGraduationDate(resume.graduation_date);
			}
			
			res.render('resume_filter', {
				authenticated: isAuthenticated(req),
				job: sponsorsScope.job,
				degree: sponsorsScope.degree,
				grad: sponsorsScope.grad,
				student: sponsorsScope.student,
				resumes: body.data,
				defaults: {}
			});
		} else {
			res.status(500).send(body);
		}
	});
});

app.post('/corporate/resumes', function(req, res) {
	if(!(req.session.roles.isCorporate || req.session.roles.isRecruiter)) {
		return res.redirect('/sponsors/login');
	}

	var headers = {
		"Authorization": GROOT_ACCESS_TOKEN
	};
	if (req.session.roles.isRecruiter) {
		headers["RECRUITER_TOKEN"] = req.session.recruiter.token;
	} else {
		headers["Netid"] = req.session.student.netid;
		headers["Token"] = req.session.student.token;
	}

	request({
		url: `${SERVICES_URL}/students`,
		method: "GET",
		json: true,
		headers: headers,
		qs: {
			name: req.body.name,
			graduationStart: req.body.gradYearStart,
			graduationEnd: req.body.gradYearEnd,
			netid: req.body.netid,
			degree_type: req.body.degreeType,
			job_type: req.body.jobType,
		}
	}, function(error, response, body) {
		if (response && response.statusCode == 200) {
			for (var resume of body.data) {
				resume.graduation_date = utils.formatGraduationDate(resume.graduation_date);
			}

			res.render('resume_filter', {
				authenticated: isAuthenticated(req),
				job: sponsorsScope.job,
				degree: sponsorsScope.degree,
				grad: sponsorsScope.grad,
				student: sponsorsScope.student,
				resumes: body.data,
				defaults: req.body
			});
		} else {
			res.status(500).send(body);
		}
	});
});

app.get('/events/upcoming', function(req, res) {
	request({
		url: `${SERVICES_URL}/events/upcoming`,
		method: "GET",
		json: true,
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN
		}
	}, function(error, response, body) {
		if (response && response.statusCode == 200) {
			res.json(body);
		}
	});
});

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
				isAdmin: validApprovalAuth(req),
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
	if (!validApprovalAuth(req)) {
		res.redirect('/intranet');
	}

	var absQuotesPath = path.resolve(__dirname) + '/views/_partials/quotes.ejs';
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
			res.status(200).send(ejs.render("<%- include('" + absQuotesPath + "') %>", { quotes : body.data, isAdmin: validApprovalAuth(req) } ));
		} else {
			res.status(response.statusCode).send(error);
		}
	});
});

app.delete('/intranet/quotes/:quoteId', function(req, res) {
	if (!validApprovalAuth(req)) {
		return res.redirect('/intranet');
	}

	var absQuotesPath = path.resolve(__dirname) + '/views/_partials/quotes.ejs';
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
			res.status(200).send(ejs.render("<%- include('" + absQuotesPath + "') %>", { quotes : body.data, isAdmin: validApprovalAuth(req) } ));
		} else {
			res.status(response.statusCode).send(body.error);
		}
	});
});

app.get('/sponsors', function(req, res) {
	res.render('sponsors', {
		authenticated: isAuthenticated(req),
	});
});

app.get('/sponsors/sponsors_list', function(req, res) {
	res.render('sponsor_list', {
		authenticated: isAuthenticated(req),
	});
});

app.get('/memes', function(req, res){
	if (!req.session.roles.isStudent) {
		return res.redirect('/login');
	}
	if(req.query.order == 'unapproved' && !validApprovalAuth(req)) {
		req.flash('error', 'Your power level isn\'t high enough to administer memes.');
		return res.redirect('/memes');
	}
	request({
		url: `${SERVICES_URL}/memes`,
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN,
			"Meme-Token": req.session.student.token
		},
		qs: {
			page: req.query.page,
			order: req.query.order
		},
		json: true
	}, function(err, response, body) {
		if(err || body.error || !body.memes) {
			return res.status(500).send("Couldn't fetch memes. :'(")
		}
		var memes = body.memes.map(function(meme) {
			meme.created_at = moment(meme.created_at).fromNow();
			return meme;
		});
		return res.render('memes', {
			authenticated: isAuthenticated(req),
			messages: req.flash('success'),
			errors: req.flash('error'),
			memes: memes,
			nextPage: body.next_page,
			prevPage: body.prev_page,
			isAdmin: validApprovalAuth(req)
		});
	});
});

app.get('/memes/upload', function(req, res) {
	if (!req.session.roles.isStudent) {
		return res.redirect('/login');
	}
	res.render('meme_upload', {
		authenticated: isAuthenticated(req)
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
			"Meme-Token": req.session.student.token
		},
		json: true,
		body: {
			title: req.body.title,
			url: req.body.url
		}
	}, function(err, response, body){
		if(err) {
			return res.status(500).send(err)
		}
		if(response.statusCode != 200 || body.error){
			req.flash('error', body.error || "Something went wrong... :'(")
		}
		else {
			req.flash('success', "Meme uploaded! Waiting on admin approval.")
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
			"Authorization": GROOT_ACCESS_TOKEN,
			"Meme-Token": req.session.student.token
		},
		json: true,
		body: {}
	}, function(err, response, body){
		if(err || body.error) {
			return req.status(500).send(err || body.error)
		}
		return res.sendStatus(200);
	});
});

app.post('/memes/admin/:meme_id', function(req, res) {
	if(!req.session.roles.isStudent) {
		return req.sendStatus(403);
	}
	if(!validApprovalAuth(req)) {
		req.flash('error', 'Your power level isn\'t high enough to approve memes.');
		return res.redirect('/memes');
	}
	var opts = {
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN,
			"Meme-Token": req.session.student.token
		},
		json: true
	};
	switch(req.query.action) {
		case 'approve':
			opts.method = "PUT";
			opts.url = `${SERVICES_URL}/memes/${req.params.meme_id}/approve`
			opts.body = {}
			break;
		case 'reject':
			opts.method = "DELETE";
			opts.url = `${SERVICES_URL}/memes/${req.params.meme_id}`
			break;
		default:
			return req.status(400).send("Invalid action.");
	}
	request(opts, function(err, response, body){
		console.log(body)
		if(err) return res.status(500).send(err);
		if(body.error) return res.status(500).send(body.error);
		return res.redirect('/memes');
	});
});
/*
process.on('uncaughtException', function (err) {
	if(process.env.EXCEPTION_FROM_EMAIL && process.env.EXCEPTION_TO_EMAIL){
		var mailOptions = {
			from: process.env.EXCEPTION_FROM_EMAIL, 
			to: process.env.EXCEPTION_TO_EMAIL,  
			subject: '[Groot-desktop-frontend] Fatal Error: ' + (new Date).toLocaleTimeString(), 
			text: 'Uncaught Exception: Groot Desktop Frontend\n' + err.stack,
		};

		transporter.sendMail(mailOptions, function(error, info){
			if(error){
				console.log(error);
			}else{
				console.log('Message sent: ' + info.response);
			}
		console.error((new Date).toLocaleTimeString() + ' uncaughtException:', err.message)
		console.error(err.stack)
		process.exit(1);

		});
	}
});
*/
app.use(express.static(__dirname + '/public'));
app.use('/sponsors', express.static(__dirname + '/public'));

// Start server and logs port as a callback
app.listen(PORT, function() {
	console.log('GROOT_DESKTOP is live on port ' + PORT + "!");
});
