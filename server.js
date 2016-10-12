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


// Serve files from public
app.use(express.static(__dirname + '/public'));

//Start server
app.listen(PORT);
console.log('GROOT_DESKTOP is live on port ' + PORT + "!");
