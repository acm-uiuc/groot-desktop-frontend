/**
 * Created by SujayKhandekar on 10/3/15.
 */

const PORT = process.env.PORT || 5000;

// Requires
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var session = require('client-sessions'); // ADDED
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
var request = require('request');

app.set('views', path.resolve(__dirname) + '/views');
app.set('view engine', 'ejs');




/* This might need to be modified depending on how other stuff works and pages
 *****************************************************************************/

// npm install client-sessions
app.use(session({
	cookieName: 'session',
	secret: 'THE_TOKEN_GOES_HERE',//apparently this doesn't matter, used for hashing??
	duration: 30*60*1000,
	activeDuration: 5*60*1000,
	httpOnly: true, // prevents browers JS from accessing cookies
	secure: true, // cookie can only be used over HTTPS
	ephemeral: true // Deletes cookie when browser closes.
}));

// Handle Sessions Accross differnt pages using express


//not sure if this is necessary
// app.use(function(req, res, next) {
// 	if (req.session && req.session.user) {
// 		User.findOne({
// 			email: req.session.user.email
// 		}, function(err, user) {
// 			if (user) {
// 				req.user = user;
// 				// delete the password from the session
// 				delete req.user.password;
// 				//refresh the session value
// 				req.session.user = user;
// 				res.locals.user = user;
// 			}
// 			// finishing processing the middleware and run the route
// 			next();
// 		});
// 	} else {
// 		next();
// 	}
// });

//TODO Add more POST endpoints for all our form interactions
app.post('/login', function(req, res){
	var netid = req.body.netid, pass = req.body.password;
	var options = {
		url: "http://localhost:8000/session?username="+netid,
		method:"POST",
		json: true,
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

	function callback(error, response, body)
	{
		if(!body || !body["token"])
		{
			// res.status(422).end();//the token could not be validated
			res.render('login', {
				error: 'Invalid email or password.'
			});

		}
		else
		{
			console.log("error: " + error);
			console.log("Response: " + response);
			console.log("Body: " + body);
			// if(error)
			// 	console.log("Error: " + error);
			// if(body["reason"])
			// 	console.log("ISSUE: " + body["reason"]);
			// else
			//	res.json(body).end();

			// set cookie with user info
			req.session.netid = netid;
			req.session.token = body["token"];
			console.log("token: " + body["token"]);
			// if user password is correct send user to homepage
			// res.redirect('home');
            console.log("session:" + req.session);
			// res.redirect("/intranet");
			res.render('intranet', {
                authenticated: true,
                session: req.session
			});
		}
	}

	request(options, callback);



});

// reset session when user logs out
app.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect('/');
// >>>>>>> sessions
});

// Check is user is logged in, if yes redirect them
function requireLogin(req, res, next) {
  if (!req.user) {
	res.redirect('/login');
  } else {
	next();
  }
};

/*********************************************************************/


app.post('/authenticate', function(req, res) {
    request.post({
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        url: 'http://localhost:8000/session',
        body: JSON.stringify(req.body),
    }, function(error, response, body) {
        console.log(body);
        res.send(body);
    });
});

app.post('/resume', function(req, res) {
    request.post({
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        url: 'http://localhost:8000/resume',
        body: JSON.stringify(req.body),
    }, function(error, response, body) {
        console.log(body);
        res.send(body);
    });
});

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
        authenticated: false,
    });
});

app.get('/login', function(req, res) {
    res.render('login', {
        authenticated: false,
    });
});

app.get('/about', function(req, res) {
    var groupsData = request({
        url: "http://localhost:9001/groups/committees",
        method: "GET"
    }, function(err, response, body) {
        if (err) {
            console.log(err);
            // Sends the 404 page
            res.status(404).send("Error:\nThis page will be implemented soon!");
        }
        /* TODO:
         *
         * So I got the data to come in using the requests module.
         * It's pulling data off of the groot-groups-service. Just need
         * somebody else to throw it on EJS accordingly :)
         */
        res.render('about', body);
    });
});

app.get('/conference', function(req, res) {
    res.render('conference', {
        authenticated: false,
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
        authenticated: false,
    });
});

app.get('/intranet', function(req, res) {
    if(req.session.token)
    {
        res.render('intranet', {
            authenticated: true,
        });
    }
    else
        res.render('login', {
            authenticated: false,
        })
});

app.post('/join', function(req, res) {
    // creates JSON object of the inputted data
    // sends data to groups-user-service
    var userData = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        netid: req.body.netid,
        uin: req.body.uin
    };
    request({
        url: "http://localhost:8001/newUser",
        method: "POST",
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
        /* URL to grab SIG data from groot-groups-service */
        url: "http://localhost:9001/groups/sigs",
        method: "GET",
    }, function(err, response, body) {
        if (err) {
            console.log(err);
            res.status(500).send("Error " + err);
            return;
        }
        res.render('join', {
            authenticated: false,
            /*
               Following 2 lines crash... Not sure what they're for
               nav_un_auth: nav_un_auth,
               nav_auth: nav_auth,
               */
            sigs: JSON.parse(body)
        });
    });
});

app.get('/sigs', function(req, res) {
    res.render('sigs', {
        authenticated: false,
    });
});

app.get('/quotes', function(req, res) {
    request.get({
        url: "http://localhost:8000/quotes"
    }, function(error, response, body) {
        if (error) {
            // TODO: ender error page
            // alert("status");
            res.status(500).send("Error " + error.code);
        } else {
            res.render('quotes', {
                authenticated: false,
                quotes: body
            });
        }
    });
});

app.get('/sponsors/new_job_post', function(req, res) {
    res.render('new_job_post', {
        authenticated: false,
    });
});

app.get('/sponsors/recruiter_login', function(req, res) {
    res.render('recruiter_login', {
        authenticated: false,
    });
});

app.get('/sponsors/resume_book', function(req, res) {
    res.render('resume_book', {
        authenticated: false,
        job: sponsorsScope.job,
        degree: sponsorsScope.degree,
        grad: sponsorsScope.grad,
        student: sponsorsScope.student
    });
});

app.get('/sponsors/resume_filter', function(req, res) {
    res.render('resume_filter', {
     		authenticated: false,
        job: sponsorsScope.job,
        degree: sponsorsScope.degree,
        grad: sponsorsScope.grad,
        student: sponsorsScope.student,
 	})
 });


app.get('/sponsors', function(req, res) {
    res.render('sponsors', {
        authenticated: false,
    });
});

app.get('/sponsors/sponsors_list', function(req, res) {
    res.render('sponsor_list', {
     		authenticated: false,
 	})
 });


app.use(express.static(__dirname + '/public'));
app.use('/sponsors', express.static(__dirname + '/public'));

//Start server and logs port as a callback
app.listen(PORT, function() {
    console.log('GROOT_DESKTOP is live on port ' + PORT + "!");
});
