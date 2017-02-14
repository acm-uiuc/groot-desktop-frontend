const SERVICES_URL = process.env.SERVICES_URL || 'http://localhost:8000';
const GROOT_ACCESS_TOKEN = process.env.GROOT_ACCESS_TOKEN || "TEMP_STRING";
const request = require('request');
const moment = require('moment');

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


var exports = module.exports = {};
exports.formatGraduationDate = function(date) {
  return moment(date).format("MMMM Y");
};

exports.getUserData = function(req, res, nextSteps){
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
};

exports.isAuthenticated = function(req) {
  return req.session.roles.isStudent || req.session.roles.isRecruiter;
};

exports.checkIfAdmin = checkIfAdmin;
exports.checkIfTop4 = checkIfTop4;
exports.checkIfCorporate = checkIfCorporate;

exports.setAuthentication = function(req, res, nextSteps) {
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
};

exports.validApprovalAuth = function(req) {
  return (req.session.roles.isAdmin || req.session.roles.isCorporate || req.session.roles.isTop4);
};

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
  for (var i = 0; i < 4; i++) { // eslint-disable-line
    sponsorsScope.grad.years.push({
      date: may + y
    });
    sponsorsScope.grad.years.push({
      date: dec + y
    });
    y++;
  }
}

exports.sponsorsScope = sponsorsScope;