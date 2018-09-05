/**
* Copyright © 2018, ACM@UIUC
*
* This file is part of the Groot Project.
*
* The Groot Project is open source software, released under the University of
* Illinois/NCSA Open Source License. You should have received a copy of
* this license in a file with the distribution.
**/

const SERVICES_URL = process.env.SERVICES_URL || 'http://localhost:8000';
const RP_URL = 'https://api.reflectionsprojections.org/';
const GROOT_ACCESS_TOKEN = process.env.GROOT_ACCESS_TOKEN || "TEMP_STRING";
const request = require('request');
const Promise = require('promise');
const utils = require('../../etc/utils.js');

// Make a request to
function fetchRPResume(resume, jwtAuth) {
  return new Promise((resolve, reject) => {
    let new_resume = Object.assign({}, resume);
    if (jwtAuth !== null) {
      request({
        url: `${RP_URL}/upload/resume/${resume.netid}/`,
        method: 'GET',
        headers: {
          "Authorization": jwtAuth,
          "Content-Type": "application/json"
        }
      }, function(error, response, body) {
        let rp_resume_url = JSON.parse(body).resume;
        if (response && response.statusCode == 200) {
          // Replace ACM resume with RP resume if RP resume exists
          new_resume.resume_url = rp_resume_url;
          resolve(new_resume);
        } else {
          reject(JSON.stringify(error));
        }
      });
    } else {
      // Return the old resume if RP authentication doesn't work (it should)
      resolve(new_resume);
    }
  });
}

// Make a request to /students and get resumes
function fetchResumes(req, res, callback) {
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
      let promises = [];
      for (let i = 0; i < body.data.length; i++) {
        var resume = body.data[i];
        resume.graduation_date = utils.formatGraduationDate(resume.graduation_date);
        promises.push(fetchRPResume(resume, req.session.rp.jwtAuth));
      }
      Promise.all(promises).then(function(resumes) {
        callback(resumes);
      });
    } else {
      res.status(500).send(body);
    }
  });
}

module.exports = function(app) {
  // R|P OAuth step redirects here, where we extract the OAuth authentication
  // code and exchange it for a JWT. Then we redirect back to /rp/resumes
  app.get('/rp/login_2', function(req, res) {
    let authorizationCode = req.query.code;
    authorizationCode.concat("#");
    request({
      url: `${RP_URL}/auth/code/google/?redirect_uri=https://acm.illinois.edu/rp/login_2`,
      method: "POST",
      json: true,
      body: { 'code': authorizationCode }
    }, function(error, response, body) {
      req.flash('jwtAuth', body.token);
      res.redirect('/rp/resumes');
    });
  });

  app.get('/rp/resumes', function(req, res) {
    if(!(req.session.roles.isCorporate || (req.session.roles.isRecruiter && req.session.recruiter.is_sponsor))) {
      res.redirect('/sponsors/login');
    }

    let jwtAuth = req.flash('jwtAuth');
    let newRpAuthenticated = JSON.stringify(jwtAuth) !== "[]";
    if (newRpAuthenticated) {
      req.session.rp.jwtAuth = jwtAuth;
    }

    fetchResumes(req, res, function(resumes) {
      res.render('rp/resume_filter', {
        authenticated: utils.isAuthenticated(req),
        rp_authenticated: req.session.rp.jwtAuth !== null,
        rp_redirect_uri: `${RP_URL}/auth/google/?redirect_uri=https://acm.illinois.edu/rp/login_2`,
        job: utils.sponsorsScope.job,
        degree: utils.sponsorsScope.degree,
        grad: utils.sponsorsScope.grad,
        student: utils.sponsorsScope.student,
        resumes: resumes,
        defaults: {}
      });
    });
  });
};
