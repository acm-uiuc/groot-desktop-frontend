/**
 * Created by SujayKhandekar on 10/3/15.
 */

const PORT = process.env.PORT || 5000;

// Requires
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var request = require('request');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.set('views', path.resolve(__dirname) + '/views');
app.set('view engine', 'ejs');

app.post('/login', function(req, res){
	console.log(req.body.netid, req.body.password)
});

app.post('/authenticate', function(req, res) {
	request.post({
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			url: 'http://localhost:8000/session',
			body: JSON.stringify(req.body),
		}, function(error, response, body){
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
var may = "May "

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

app.get('/', function (req, res) {
  res.render('home', {
		authenticated: false,
	});
});

app.get('/login', function(req, res) {
	res.render('login', {
		authenticated: false,
	})
});

app.get('/about', function(req, res) {
	var groupsData = request({
		url: "http://localhost:9001/groups/committees",
		method: "GET"
	}, function(err, response, body) {
		if(err) {
			console.log(err);
			// Sends the 404 page
			response.sendFile(path.join(__dirname, '404.html'));
		}
		/* TODO:
		 *
		 * So I got the data to come in using the requests module.
		 * It's pulling data off of the groot-groups-service. Just need
		 * somebody else to throw it on EJS accordingly :)
		 */
		res.render('about', body);
	});
	// res.render('about', {
	// 	authenticated: false,
	// 	groups:[
 //      {
 //        name: 'Top4',
 //        contacts: [
 //          {
 //            title: 'Chair',
 //            name: 'Naren Dasan',
 //            email: 'acm@illinois.edu'
 //          },{
 //            title: 'Vice Chair',
 //            name: 'Sathvika Ashokkumar',
 //            email: 'vice-chair@acm.illinois.edu'
 //          },{
 //            title: 'Treasurer',
 //            name: 'Tommy Yu',
 //            email: 'treasurer@acm.illinois.edu'
 //          },{
 //            title: 'Secretary',
 //            name: 'Alec Kochevar-Cureton',
 //            email: 'secretary@acm.illinois.edu'
 //          }
 //        ]
 //      }, {
 //        name: 'Admin',
 //        contacts: [
 //          {
 //            email: 'admin@acm.illinois.edu'
 //          }
 //        ]
 //      }, {
 //        name: 'Corporate',
 //        contacts: [
 //              {
 //                  name: 'Amanda Sopkin'
 //              },{
 //                  name: 'Sujay Khandekar'
 //              },{
 //                  name: 'Tyler Kim'
 //              },{
 //                  email: 'corporate@acm.illinois.edu'
 //              }
 //          ]
 //      },{
 //          name: 'Projects',
 //          contacts: [
 //              {
 //                  name: 'Kevin Wang',
 //                  title: 'Co-Chair'
 //              },{
 //                  email: 'projects@acm.illinois.edu'
 //              }
 //          ]
 //      },{
 //          name: 'Social',
 //          contacts: [
 //              {
 //                  name: 'Laura Licari',
 //                  title: 'Chair'
 //              },{
 //                  email: 'social@acm.illinois.edu'
 //              }
 //          ]
 //      },{
 //          name: 'Banks of the Boneyard',
 //          contacts: [
 //              {
 //                  name: 'Connie Fan',
 //                  title: 'Editor'
 //              },{
 //                  email: 'boneyard@acm.illinois.edu'
 //              }
 //          ]
 //        }
 //    ]
	// })
});

app.get('/conference', function(req, res) {
	res.render('conference', {
		authenticated: false,
		editions: [
				{year: '2016', path: '/conference/2016'},
				{year: '2015', path: '/conference/2015'},
				{year: '2014', path: '/conference/2014'},
				{year: '2013', path: '/conference/2013'},
				{year: '2012', path: '/conference/2012'},
				{year: '2011', path: '/conference/2011'},
				{year: '2010', path: '/conference/2010'},
				{year: '2009', path: '/conference/2009'},
				{year: '2008', path: '/conference/2008'},
				{year: '2007', path: '/conference/2007'},
				{year: '2006', path: '/conference/2006'},
				{year: '2005', path: '/conference/2005'},
				{year: '2004', path: '/conference/2004'},
				{year: '2003', path: '/conference/2003'},
				{year: '2002', path: '/conference/2002'},
				{year: '2001', path: '/conference/2001'},
				{year: '2000', path: '/conference/2000'},
				{year: '1999', path: '/conference/1999'},
				{year: '1998', path: '/conference/1998'},
				{year: '1997', path: '/conference/1997'},
				{year: '1996', path: '/conference/1996'},
				{year: '1995', path: '/conference/1995'},
		]
	})
});

app.get('/events', function(req, res) {
	res.render('events', {
		authenticated: false,
	})
});

app.get('/intranet', function(req, res) {
	res.render('intranet', {
		authenticated: false,
	})
});

app.get('/join', function(req, res) {
	res.render('join', {
		authenticated: false,
		sigs: [] // TODO: Call Ish's groups-service
	})
});

app.get('/sigs', function (req, res) {
  res.render('sigs', {
		authenticated: false,
	});
});

app.get('/quotes', function (req, res) {
	request.get({
			url: 'http://localhost:8000/quotes'
		}, function(error, response, body){
			if(error){
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

app.get('/sponsors/new_job_post', function (req, res) {
  res.render('new_job_post', {
		authenticated: false,
	});
});

app.get('/sponsors/recruiter_login', function(req, res) {
	res.render('recruiter_login', {
		authenticated: false,
	})
});

app.get('/sponsors/resume_book', function (req, res) {
  res.render('resume_book', {
		authenticated: false,
		job: sponsorsScope.job,
		degree: sponsorsScope.degree,
		grad: sponsorsScope.grad,
		student: sponsorsScope.student
	});
});

app.get('/sponsors', function (req, res) {
  res.render('sponsors', {
		authenticated: false,
	});
});

app.use(express.static(__dirname + '/public'));
app.use('/sponsors', express.static(__dirname + '/public'));

//Start server and logs port as a callback
app.listen(PORT, function() {
	console.log('GROOT_DESKTOP is live on port ' + PORT + "!");	
});
