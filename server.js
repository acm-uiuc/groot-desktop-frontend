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



app.get('/', function (req, res) {
  res.render('index', {
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

// Serve files from public
app.use(express.static(__dirname + '/public'));

//Start server
app.listen(PORT);
console.log('GROOT_DESKTOP is live on port ' + PORT + "!");
