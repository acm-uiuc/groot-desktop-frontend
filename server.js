/**
* Copyright © 2016, ACM@UIUC
*
* This file is part of the Groot Project.  
* 
* The Groot Project is open source software, released under the University of
* Illinois/NCSA Open Source License. You should have received a copy of
* this license in a file with the distribution.
**/

// Requires
var path = require("path");
require('dotenv').config({path: path.resolve(__dirname) + '/.env'});
var express = require('express');
var ejs = require('ejs');
var fileUpload = require('express-fileupload'); // ADDED
var app = express();
var bodyParser = require('body-parser');
var session = require('client-sessions'); // ADDED
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
var request = require('request');
var moment = require('moment');


const PORT = process.env.PORT || 5000;
const SERVICES_URL = process.env.SERVICES_URL || 'http://localhost:8000';
const GROOT_ACCESS_TOKEN = process.env.GROOT_ACCESS_TOKEN || "TEMP_STRING";
const GROOT_RECRUITER_TOKEN = process.env.GROOT_RECRUITER_TOKEN || "TEMP_STRING";

app.set('views', path.resolve(__dirname) + '/views');
app.set('view engine', 'ejs');
// npm install client-sessions
app.use(session({
	cookieName: 'session',
	secret: process.env.SESSION_TOKEN,//used for hashing
	duration: 30*60*1000,
	activeDuration: 5*60*1000,
	httpOnly: true, // prevents browers JS from accessing cookies
	secure: true, // cookie can only be used over HTTPS
	ephemeral: true // Deletes cookie when browser closes.
}));

// Handle Sessions across different pages using express

/*
	Listing of session variables:
		roles object has two main roles: student and recruiter
		student is broken down into: admin, top4, corporate.

		session.netid
		session.token
*/
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
		method:"POST",
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
			res.render('login', {
				authenticated: false,
				error: 'Invalid email or password.'
			});
		}
		else {
			if(error) {
				console.log("Error: " + error);
			}
			if(body["reason"]) {
				console.log("ISSUE: " + body["reason"]);
			}
				
			req.session.netid = netid;
			req.session.username = netid;
			req.session.token = body["token"];
			req.session.roles.isStudent = true;

			setAuthentication(req, res, function(req, res) {
				res.redirect('/intranet');
			});
		}
	}
	request(options, callback);
});

app.post('/sponsors/recruiter_login', function(req, res) {
    request({
		url: `${SERVICES_URL}/recruiters/login`,
		method: "POST",
		headers: {
            "Authorization": GROOT_RECRUITER_TOKEN
        },
        json: true,
		body: req.body
	}, function(err, response, body) {
		if (response && response.statusCode == 200) {
			req.session.recruiter = body.data;
			req.session.username = body.data.first_name;
			req.session.roles.isRecruiter = true;
			
			setAuthentication(req, res, function(req, res) {
				res.redirect('/intranet');
			});
		} else {
			res.render('recruiter_login', {
				authenticated: false,
				error: body.error
			});
		}
	});
});

function isAuthenticated(req) {
	return req.session.roles.isStudent || req.session.roles.isRecruiter;
}

function setAuthentication(req, res, nextSteps) {
	var netid = req.session.netid;
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
	request({
		method:"GET",
		url: `${SERVICES_URL}/groups/committees/admin?isMember=${req.session.netid}`,
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN
		}
	}, function(error, response, body) {
		if(response && response.statusCode == 200) {
			req.session.roles.isAdmin = (JSON.parse(body).isValid  == 'true');
		}		
		nextSteps(req, res);
	});
}

function checkIfCorporate(req, res, nextSteps) {
	request({
		method:"GET",
		url: `${SERVICES_URL}/groups/committees/corporate?isMember=${req.session.netid}`,
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN
		}
	}, function(error, response, body) {
		if(response && response.statusCode == 200) {
			req.session.roles.isCorporate = (JSON.parse(body).isValid  == 'true');
		}		
		nextSteps(req, res);
	});
}

function checkIfTop4(req, res, nextSteps) {
	request({
		method:"GET",
		url: `${SERVICES_URL}/groups/committees/Top4?isMember=${req.session.netid}`,
		headers: {
			"Authorization": GROOT_ACCESS_TOKEN
		}
	}, function(error, response, body) {
		if(response && response.statusCode == 200) {
			req.session.roles.isTop4 = (JSON.parse(body).isValid  == 'true');
		}		
		nextSteps(req, res);
	});
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
	student: {
		firstName: null,
		lastName: null,
		netid: null,
		email: null,
		gradYear: null,
		degreeType: null,
		jobType: null,
		resume: null,
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
		res.redirect('intranet');
	} else {
		res.render('login', {
			authenticated: false,
		});
	}
});

app.get('/about', function(req, res) {
    var groupsData = request({
        url: `${SERVICES_URL}/groups/committees`,
        headers: {
			"Authorization": GROOT_ACCESS_TOKEN
		},
        method: "GET"
    }, function(err, response, body) {
        if (err) {
            // Sends the 404 page
            res.status(404).send("Error:\nThis page will be implemented soon!");
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
			{ year: '2011', path: '/conference/2011' },
			{ year: '2010', path: '/conference/2010' },
			{ year: '2009', path: '/conference/2009' },
			{ year: '2008', path: '/conference/2008' },
			{ year: '2007', path: '/conference/2007' },
			{ year: '2006', path: '/conference/2006' },
			{ year: '2005', path: '/conference/2005' },
			{ year: '2004', path: '/conference/2004' },
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

app.get('/events', function(req, res) {
	res.render('events', {
		authenticated: isAuthenticated(req),
	});
});

app.get('/intranet', function(req, res) {
	if(!isAuthenticated(req)) {
		res.redirect('login');
	}
	
	res.render('intranet', {
		authenticated: true,
		session: req.session
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
        url: `${SERVICES_URL}/newUser`,
        method: "POST",
        headers: {
			"Authorization": GROOT_ACCESS_TOKEN
		},
        body: userData,
        json: true
    }, function(err, response, body) {
        if(err) {
            console.log(err);
            res.status(520).send("Error: Please go yell at ACM to fix their shit!");
            return;
        }
        console.log("Successfully added new preUser: " + req.body.first_name + " " + req.body.last_name);
        res.redirect('/');
    });
});

app.get('/join', function(req, res) {
    // Going to grab SIG data from the micro-service
    request({
        url: `${SERVICES_URL}/groups/sigs`,
        headers: {
			"Authorization": GROOT_ACCESS_TOKEN
		},
        method: "GET",
    }, function(err, response, body) {
        if (err) {
            console.log(err);
            res.status(500).send("Error " + err);
            return;
        }
        res.render('join', {
            authenticated: false,
            sigs: JSON.parse(body)
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
        if (err) {
            console.log(err);
            res.status(500).send("Error " + err);
            return;
        }
        sigs = JSON.parse(body);
        sigs_a = sigs.slice(0, sigs.length / 2);
        sigs_b = sigs.slice(sigs.length / 2 + 1, sigs.length - 1);
        res.render('sigs', {
            authenticated: isAuthenticated(req),
            sig_col_a: sigs_a,
            sig_col_b: sigs_b,
        });
    });
});

app.get('/quotes', function(req, res) {
    request.get({
        url: `${SERVICES_URL}/quotes`,
        headers: {
			"Authorization": GROOT_ACCESS_TOKEN
		},
		method: "GET",
    }, function(error, response, body) {
        if (error) {
            // TODO: ender error page
            // alert("status");
            res.status(500).send("Error " + error.code);
        } else {
            res.render('quotes', {
                authenticated: isAuthenticated(req),
                quotes: body
            });
        }
    });
});

app.get('/sponsors/new_job_post', function(req, res) {
	res.render('new_job_post', {
		authenticated:  isAuthenticated(req),
		success: null,
		error: null
	});
});

app.post('/sponsors/new_job_post', function(req, res) {
    request({
        url: `${SERVICES_URL}/jobs`,
        method: "POST",
        headers: {
            "Authorization": GROOT_RECRUITER_TOKEN
        },
        json: true,
        body: req.body
    }, function(err, response, body) {
        if (response.statusCode == 200) {
			res.render('new_job_post', {
				authenticated: isAuthenticated(req),
				success: "You have successfully entered a new job.",
				error: null
			});
        } else {
            res.render('new_job_post', {
				authenticated: isAuthenticated(req),
				success: null,
				error: "Error with creating your job: " + body.error
			});
        }
    });
});

app.get('/sponsors/corporate_manager', function(req, res) {
	if (!req.session.roles.isCorporate) {
		res.redirect('/login');
	}

	request({
		url: `${SERVICES_URL}/jobs`,
		method: "GET",
		json: true,
		headers: {
			"Authorization": GROOT_RECRUITER_TOKEN
		}
	}, function(error, response, body) {
		if (response && response.statusCode != 200) {
			res.status(response.statusCode).send("Error: " + body.error);
		} else {
			request({
				url: `${SERVICES_URL}/students?approved_resumes=false`,
				method: "GET",
				json: true,
				headers: {
					"Authorization": GROOT_RECRUITER_TOKEN
				}
			}, function(s_error, s_response, s_body) {
				if (s_response && s_response.statusCode != 200) {
					res.status(s_response.statusCode).send("Error: " + s_body.error);
				} else {
					request({
						url: `${SERVICES_URL}/recruiters`,
						method: "GET",
						json: true,
						headers: {
							"Authorization": GROOT_RECRUITER_TOKEN
						},
					}, function(r_error, r_response, r_body) {
						if (r_response && r_response.statusCode != 200) {
							res.status(r_response.statusCode).send("Error: " + r_body.error);
						} else {
							res.render('corporate_manager', {
								job: sponsorsScope.job,
								degree: sponsorsScope.degree,
								grad: sponsorsScope.grad,
								student: sponsorsScope.student,
								unapproved_resumes: s_body.data,
								job_listings: body.data,
								recruiters: r_body.data,
								authenticated: true
							});
						}
					});
				}
			});
		}
	});
});

app.post('/sponsors/corporate_manager', function(req, res) {
	if (!req.session.roles.isCorporate) {
		res.redirect('/intranet');
	}

	request({
		url: `${SERVICES_URL}/recruiters`,
		method: "POST",
		json: true,
		headers: {
			"Authorization": GROOT_RECRUITER_TOKEN
		},
		body: req.body
	}, function(error, response, body) {
		if (response && response.statusCode != 200) {
			res.status(response.statusCode).send("Error: " + body.error);
		} else {
			res.redirect('/sponsors/corporate_manager');
		}
	});
});

app.put('/students/:netid/approve', function(req, res) {
	if (!isAuthenticated(req)) {
		res.redirect('/login');
	}

	var absResumePath = path.resolve(__dirname) + '/views/_partials/unapproved_resumes.ejs';
	request({
		url: `${SERVICES_URL}/students/` + req.params.netid + `/approve`,
		method: "PUT",
		headers: {
			"Authorization": GROOT_RECRUITER_TOKEN,
			"Netid": req.session.netid,
			"Token": req.session.token  
		},
		json: true,
		body: {}
	}, function(error, response, body) {
		if (response && response.statusCode == 200) {
			res.status(200).send(ejs.render("<%- include('" + absResumePath + "') %>", { unapproved_resumes : body.data } ));
		} else {
			res.status(response.statusCode).send(body.error);
		}
	});
});

app.delete('/students/:netid', function(req, res) {
	if (!isAuthenticated(req)) {
		res.redirect('/login');
	}

	var absResumePath = path.resolve(__dirname) + '/views/_partials/unapproved_resumes.ejs';
	request({
		url: `${SERVICES_URL}/students/` + req.params.netid,
		method: "DELETE",
		headers: {
			"Authorization": GROOT_RECRUITER_TOKEN,
			"Netid": req.session.netid,
			"Token": req.session.token  
		},
		json: true,
		body: {}
	}, function(error, response, body) {
		if (response && response.statusCode == 200) {
			res.status(200).send(ejs.render("<%- include('" + absResumePath + "') %>", { unapproved_resumes : body.data } ));
		} else {
			res.status(response.statusCode).send(body.error);
		}
	});
});

app.put('/jobs/:jobId/approve', function(req, res) {
	if (!isAuthenticated(req)) {
		res.redirect('/login');
	}
	
	var absJobPath = path.resolve(__dirname) + '/views/_partials/unapproved_jobs.ejs';
	request({
		url: `${SERVICES_URL}/jobs/` + req.params.jobId + `/approve`,
		method: "PUT",
		headers: {
			"Authorization": GROOT_RECRUITER_TOKEN,
			"Netid": req.session.netid,
			"Token": req.session.token  
		},
		json: true,
		body: {}
	}, function(error, response, body) {
		if (response && response.statusCode == 200) {
			res.status(200).send(ejs.render("<%- include('" + absJobPath + "') %>", { job_listings : body.data } ));
		} else {
			res.status(response.statusCode).send(body.error);
		}
	});
});

app.delete('/jobs/:jobId', function(req, res) {
	if (!isAuthenticated(req)) {
		res.redirect('/login');
	}

	var absJobPath = path.resolve(__dirname) + '/views/_partials/unapproved_jobs.ejs';
	request({
		url: `${SERVICES_URL}/jobs/` + req.params.jobId,
		method: "DELETE",
		headers: {
			"Authorization": GROOT_RECRUITER_TOKEN,
			"Netid": req.session.netid,
			"Token": req.session.token  
		},
		json: true,
		body: {}
	}, function(error, response, body) {
		if (response && response.statusCode == 200) {
			res.status(200).send(ejs.render("<%- include('" + absJobPath + "') %>", { job_listings : body.data } ));
		} else {
			res.status(response.statusCode).send(body.error);
		}
	});
});

app.get('/sponsors/recruiter_login', function(req, res) {
	if(isAuthenticated(req)) {
		res.redirect('/intranet');
	} else {
		res.render('recruiter_login', {
			authenticated: false,
		});
	}
});

app.get('/sponsors/resume_book', function(req, res) {
    res.render('resume_book', {
		authenticated: isAuthenticated(req),
        job: sponsorsScope.job,
        degree: sponsorsScope.degree,
        grad: sponsorsScope.grad,
        student: sponsorsScope.student,
		error: null
    });
});

app.post('/sponsors/resume_book', function(req, res) {
    request({
        url: `${SERVICES_URL}/students`,
        method: "POST",
        headers: {
            "Authorization": GROOT_RECRUITER_TOKEN
        },
        json: true,
        body: req.body
    }, function(err, response, body) {
        if (response.statusCode == 200) {
            res.render('home', {
                authenticated: isAuthenticated(req),
            });
        } else {
            res.render('resume_book', {
				authenticated: isAuthenticated(req),
        		job: sponsorsScope.job,
        		degree: sponsorsScope.degree,
        		grad: sponsorsScope.grad,
        		student: sponsorsScope.student,
				error: body.error
			});
        }
    });
});

app.get('/sponsors/resume_filter', function(req, res) {
  res.render('resume_filter', {
      authenticated:  req.session.auth,
      job: sponsorsScope.job,
      degree: sponsorsScope.degree,
      grad: sponsorsScope.grad,
      student: sponsorsScope.student,
      resumes: [],
      defaults: {}
  });
});

app.post('/sponsors/resume_filter', function(req, res) {
  request({
    url: `${SERVICES_URL}/students`,
    method: "GET",
    json: true,
    headers: {
        "Authorization": GROOT_RECRUITER_TOKEN
    },
    body: {
      "name": req.body.name,
      "graduationStart": req.body.gradYearStart,
      "graduationEnd": req.body.gradYearStart,
      "netid": req.body.netid,
      "degree_type": req.body.degreeType,
      "job_type": req.body.jobType,
    }
  }, function(error, response, body) {
        if(error){
          res.status(500).send("Error " + error.code);
        }
        else if(body.error) {
          res.status(500).send("Error: " + body.error)
        }
        else{
          for( var resume of body.data ){
            resume.graduation_date = moment(resume.graduation_date).format("MMMM Y")
          }
          res.render('resume_filter', {
              authenticated:  req.session.auth,
              job: sponsorsScope.job,
              degree: sponsorsScope.degree,
              grad: sponsorsScope.grad,
              student: sponsorsScope.student,
              resumes: body.data,
              defaults: req.body
          });
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

app.use(express.static(__dirname + '/public'));
app.use('/sponsors', express.static(__dirname + '/public'));

// //Start server and logs port as a callback
app.listen(PORT, function() {
	console.log('GROOT_DESKTOP is live on port ' + PORT + "!");
});
