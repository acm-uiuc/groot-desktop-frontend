/**
 * Created by SujayKhandekar on 10/3/15.
 */

const PORT = 5000;

// Requires
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
var request = require('request');

app.set('views', './views');
app.set('view engine', 'pug');

//TODO Add more POST endpoints for all our form interactions
app.post('/login', function(req, res){
	// Login
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

// test data
var nav_un_auth = [
		{name: 'About', path: '/about'},
		{name: 'SIGs', path: '/sigs'},
		{name: 'Events', path: '/events'},
		{name: 'Reflections|Projections', path: '/conference'},
		{name: 'Sponsors',path: '/sponsors'},
		{name: 'Join', path: '/join'}
];

var nav_auth = [
		{name: 'About', path: '/about'},
		{name: 'SIGs', path: '/sigs'},
		{name: 'Events', path: '/events'},
		{name: 'Reflections|Projections', path: '/conference'},
		{name: 'Sponsors',path: '/sponsors'},
		{name: 'Intranet', path: '/intranet'}
];

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
		nav_un_auth: nav_un_auth,
		nav_auth: nav_auth
	});
});

app.get('/login', function(req, res) {
	res.render('login', {
		authenticated: false,
		nav_un_auth: nav_un_auth,
		nav_auth: nav_auth
	})
});

app.get('/about', function(req, res) {
	res.render('about', {
		authenticated: false,
		nav_un_auth: nav_un_auth,
		nav_auth: nav_auth,
		groups:[
      {
        name: 'Top4',
        contacts: [
          {
            title: 'Chair',
            name: 'Naren Dasan',
            email: 'acm@illinois.edu'
          },{
            title: 'Vice Chair',
            name: 'Sathvika Ashokkumar',
            email: 'vice-chair@acm.illinois.edu'
          },{
            title: 'Treasurer',
            name: 'Tommy Yu',
            email: 'treasurer@acm.illinois.edu'
          },{
            title: 'Secretary',
            name: 'Alec Kochevar-Cureton',
            email: 'secretary@acm.illinois.edu'
          }
        ]
      }, {
        name: 'Admin',
        contacts: [
          {
            email: 'admin@acm.illinois.edu'
          }
        ]
      }, {
        name: 'Corporate',
        contacts: [
              {
                  name: 'Amanda Sopkin'
              },{
                  name: 'Sujay Khandekar'
              },{
                  name: 'Tyler Kim'
              },{
                  email: 'corporate@acm.illinois.edu'
              }
          ]
      },{
          name: 'Projects',
          contacts: [
              {
                  name: 'Kevin Wang',
                  title: 'Co-Chair'
              },{
                  email: 'projects@acm.illinois.edu'
              }
          ]
      },{
          name: 'Social',
          contacts: [
              {
                  name: 'Laura Licari',
                  title: 'Chair'
              },{
                  email: 'social@acm.illinois.edu'
              }
          ]
      },{
          name: 'Banks of the Boneyard',
          contacts: [
              {
                  name: 'Connie Fan',
                  title: 'Editor'
              },{
                  email: 'boneyard@acm.illinois.edu'
              }
          ]
        }
    ]
	})
});

app.get('/conference', function(req, res) {
	res.render('conference', {
		authenticated: false,
		nav_un_auth: nav_un_auth,
		nav_auth: nav_auth,
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
		nav_un_auth: nav_un_auth,
		nav_auth: nav_auth
	})
});

app.get('/intranet', function(req, res) {
	res.render('intranet', {
		authenticated: false,
		nav_un_auth: nav_un_auth,
		nav_auth: nav_auth
	})
});

app.get('/join', function(req, res) {
	res.render('join', {
		authenticated: false,
		nav_un_auth: nav_un_auth,
		nav_auth: nav_auth,
		sigs: [
				{
						name:'Gamebuilders',
						description: "Anything and everything related to game development",
						Chairs:'Michael Parilla',
						meetingTime:'19:00',
						meetingDay:'Tuesday',
						meetingLoc:'Siebel 3405',
						site:'http://www.acm.uiuc.edu/gamebuilders/',
						members:[],
						email:'Gamebuilders@acm.uiuc.edu',
						join:false
				},
				{
						name:'GNU LUG',
						description: "GNU Linux Users Group",
						chairs:'Wayland Morgan, Jonathan Schipp',
						meetingTime:'20:00',
						meetingDay:'Monday',
						meetingLoc:'CSL 301',
						site:'http://www.acm.uiuc.edu/lug/',
						members:[],
						email:'Gnulug-l@acm.uiuc.edu',
						join:false
				},
				{
						name:'ICPC',
						description: "Facilitate the development of contest programming skills, with the goal of producing highly competitive teams in the prestigious ACM ICPC competition.",
						chairs:'Arthur Li, Matthew Worley',
						meetingTime:'18:00',
						meetingDay:'Tuesday',
						meetingLoc:'Siebel 218',
						site:' http://icpc.cs.illinois.edu/',
						members:[],
						email:'ICPC-l@acm.uiuc.edu',
						join:false
				},
				{
						name:'OpenNSM',
						description: "Special Interest Group for Open (sourced) Network Security Monitoring",
						chairs:'Shane Rogers, Jonathan Schipp',
						meetingTime:'18:00',
						meetingDay:'Monday',
						meetingLoc:'CSL 301',
						site:'http://open-nsm.net/',
						members:[],
						email:'Website-l@acm.uiuc.edu',
						join:false
				},
				{
						name:'SIGArt',
						 description: "Special Interest Group for Artificial Intelligence",
						 chairs:'Jordan Luber',
						 meetingTime:'13:00',
						 meetingDay:'Sunday',
						 meetingLoc:'Siebel 1105',
						 site:'http://www.acm.uiuc.edu/sigart/',
						 members:[],
						 email:'SIGArt-l@acm.uiuc.edu',
						 join:false
				 },
				{
						name:'SIGBio',
						description: "To pursue biological computing and cybernetics.",
						chairs:'Jennifer Kokkines, Austin Walters',
						meetingTime:'17:00',
						meetingDay:'Tuesday',
						meetingLoc:'',
						site:'',
						members:[],
						email:'SIGBio-l@acm.uiuc.edu',
						join:false
				},
				{
						name:'SIGBot',
						description: "Special Interest Group for Robotics",
						chairs:'Anna Galusza, Bryan Plummer',
						meetingTime:'14:00',
						meetingDay:'Sunday',
						meetingLoc:'Siebel 1105',
						site:'http://www.acm.uiuc.edu/sigbot/',
						members:[],
						email:' SIGBot@acm.uiuc.edu',
						join:false
				},
				{
						name:'SIGCHI',
						description: "Special Interest Group for Human-Computer Interaction.",
						chairs:'Andrew Kuznetsov',
						meetingTime:'17:00',
						meetingDay:'Wednesday',
						meetingLoc:'Siebel 1302',
						site:'http://www.acm.uiuc.edu/sigchi',
						members:[],
						email:'SIGCHI-l@acm.uiuc.edu',
						join:false
				},
				{
						name:'SIGCoin',
						description: "",
						chairs:'',
						meetingTime:'',
						meetingDay:'',
						meetingLoc:'',
						site:'',
						members:[],
						email:'',
						join:false
				},
				{
						name:'SIGDave',
						description: "",
						chairs:'',
						meetingTime:'',
						meetingDay:'',
						meetingLoc:'',
						site:'',
						members:[],
						email:'',
						join:false
				},
				{
						name:'SIGEducation',
						description: "",
						chairs:'',
						meetingTime:'',
						meetingDay:'',
						meetingLoc:'',
						site:'',
						members:[],
						email:'',
						join:false
				},
				{
						name:'SIGEmbedded',
						description: "",
						chairs:'',
						meetingTime:'',
						meetingDay:'',
						meetingLoc:'',
						site:'',
						members:[],
						email:'',
						join:false
				},
				{
						name:'SIGGRAPH',
						description: "",
						chairs:'',
						meetingTime:'',
						meetingDay:'',
						meetingLoc:'',
						site:'',
						members:[],
						email:'',
						join:false
				},
				{
						name:'SIGMIS',
						description: "",
						chairs:'',
						meetingTime:'',
						meetingDay:'',
						meetingLoc:'',
						site:'',
						members:[],
						email:'',
						join:false
				},
				{
						name:'SIGMobile',
						description: "",
						chairs:'',
						meetingTime:'',
						meetingDay:'',
						meetingLoc:'',
						site:'',
						members:[],
						email:'',
						join:false
				},
				{
						name:'SIGMusic',
						description: "",
						chairs:'',
						meetingTime:'',
						meetingDay:'',
						meetingLoc:'',
						site:'',
						members:[],
						email:'',
						join:false
				},
				{
						name:'SIGOps',
						description: "",
						chairs:'',
						meetingTime:'',
						meetingDay:'',
						meetingLoc:'',
						site:'',
						members:[],
						email:'',
						join:false
				},
				{
						name:'SIGPlan',
						description: "",
						chairs:'',
						meetingTime:'',
						meetingDay:'',
						meetingLoc:'',
						site:'',
						members:[],
						email:'',
						join:false
				},
				{
						name:'SIGPony',
						description: "",
						chairs:'',
						meetingTime:'',
						meetingDay:'',
						meetingLoc:'',
						site:'',
						members:[],
						 email:'',
						 join:false
				 },
				{
						name:'SIGSoft',
						description: "",
						chairs:'',
						meetingTime:'',
						meetingDay:'',
						meetingLoc:'',
						site:'',
						members:[],
						email:'',
						join:false
				},
				{
						name:'WebMonkeys',
						description: "",
						chairs:'',
						meetingTime:'',
						meetingDay:'',
						meetingLoc:'',
						site:'',
						members:[],
						join:false
				}
		]
	})
});

app.get('/sigs', function (req, res) {
  res.render('sigs', {
		authenticated: false,
		nav_un_auth: nav_un_auth,
		nav_auth: nav_auth
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
					nav_un_auth: nav_un_auth,
					nav_auth: nav_auth,
					quotes: body
				});
			}
	});
});

app.get('/sponsors/new_job_post', function (req, res) {
  res.render('new_job_post', {
		authenticated: false,
		nav_un_auth: nav_un_auth,
		nav_auth: nav_auth
	});
});

app.get('/sponsors/recruiter_login', function(req, res) {
	res.render('recruiter_login', {
		authenticated: false,
		nav_un_auth: nav_un_auth,
		nav_auth: nav_auth
	})
});

app.get('/sponsors/resume_book', function (req, res) {
  res.render('resume_book', {
		authenticated: false,
		nav_un_auth: nav_un_auth,
		nav_auth: nav_auth,
		job: sponsorsScope.job,
		degree: sponsorsScope.degree,
		grad: sponsorsScope.grad,
		student: sponsorsScope.student
	});
});

app.get('/sponsors', function (req, res) {
  res.render('sponsors', {
		authenticated: false,
		nav_un_auth: nav_un_auth,
		nav_auth: nav_auth
	});
});

// Serve files from public
app.use(express.static(__dirname + '/public'));

//Start server
app.listen(PORT);
console.log('GROOT_DESKTOP is live on port ' + PORT + "!");
