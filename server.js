/**
 * Created by SujayKhandekar on 10/3/15.
 */

const PORT = 8000;

// Requires
var express = require('express');
var app = express();

// Serve files from public
app.use(express.static(__dirname + '/public'));

//Start server
app.listen(PORT);
