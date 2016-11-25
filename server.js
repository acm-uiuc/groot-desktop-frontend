/**
 * Created by SujayKhandekar on 10/3/15.
 */

const PORT = process.env.PORT || 5000;
const SERVICES_URL = 'http://localhost:8000'

// Requires
var express = require('express');
var fileUpload = require('express-fileupload'); // ADDED
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var session = require('client-sessions'); // ADDED
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
var request = require('request');

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.set('views', path.resolve(__dirname) + '/views');
app.set('view engine', 'ejs');

/* This might need to be modified depending on how other stuff works and pages
 *****************************************************************************/

// npm install client-sessions
app.use(session({
	cookieName: 'session',
	secret: 'THE_TOKEN_GOES_HERE',
	duration: 30*60*1000,
	activeDuration: 5*60*1000,
	httpOnly: true, // prevents browers JS from accessing cookies
	secure: true, // cookie can only be used over HTTPS
	ephemeral: true // Deletes cookie when browser closes.
}));

// Handle Sessions Across differnt pages using express
app.use(function(req, res, next) {
 	if (req.session && req.session.user) {
    	User.findOne({
    		email: req.session.user.email
    	}, function(err, user) {
	      	if (user) {
			    req.user = user;
			    // delete the password from the session
			    delete req.user.password;
			    //refresh the session value
			    req.session.user = user;
			    res.locals.user = user;
	     	}
	      	// finishing processing the middleware and run the route
	      	next();
	    });
  	} else {
    	next();
  	}
});

//TODO Add more POST endpoints for all our form interactions
app.post('/login', function(req, res){
  User.findOne({ email: req.body.netid }, function(err, user) {
  	//console.log(req.body.netid, req.body.password)
    // If user is not logged in give error message
    if (!user) {
      res.render('login', {
      	error: 'Invalid email or password.'
      });
    } else {
      // if user email is correct check password
      if (req.body.password === user.password) {
      	// set cookie with user info
      	req.session.user = user;
      	// if user password is correct send user to homepage
        res.redirect('/home');
      } else {
      	// if password is not correct render login
        res.render('login', {
        	error: 'Invalid email or password.'
        });
      }
    }
  });
});

// reset session when user logs out
app.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect('/');
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
			url: `${SERVICES_URL}/session`,
			body: JSON.stringify(req.body),
		}, function(error, response, body){
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
        url: `${SERVICES_URL}/groups/committees`,
        method: "GET"
    }, function(err, response, body) {
        if (err) {
            console.log(err);
            // Sends the 404 page
            res.status(404).send("Error:\nThis page will be implemented soon!");
        }
        res.render('about', {
            authenticated: false,
            committees: JSON.parse(body),
        });
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
    res.render('intranet', {
        authenticated: false,
    });
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
        url: `${SERVICES_URL}/newUser`,
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
        url: `${SERVICES_URL}/groups/sigs`,
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
    request({
        /* URL to grab SIG data from groot-groups-service */
        url: `${SERVICES_URL}/groups/sigs`,
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
            authenticated: false,
            sig_col_a: sigs_a,
            sig_col_b: sigs_b,
        });
    });
});

app.get('/quotes', function(req, res) {
    request.get({
        url: `${SERVICES_URL}/quotes`
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
