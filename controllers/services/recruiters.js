/**
* Copyright © 2017, ACM@UIUC
*
* This file is part of the Groot Project.  
* 
* The Groot Project is open source software, released under the University of
* Illinois/NCSA Open Source License. You should have received a copy of
* this license in a file with the distribution.
**/

const SERVICES_URL = process.env.SERVICES_URL || 'http://localhost:8000';
const GROOT_ACCESS_TOKEN = process.env.GROOT_ACCESS_TOKEN || "TEMP_STRING";
const request = require('request');
const moment = require('moment');
const utils = require('../../etc/utils.js');
const path = require('path');
const ejs = require('ejs');

module.exports = function(app) {
  app.get('/corporate/manage', function(req, res) {
    if (!req.session.roles.isCorporate) {
      return res.redirect('/login');
    }

    request({
      url: `${SERVICES_URL}/jobs?approved=false`,
      method: "GET",
      json: true,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN
      }
    }, function(error, response, body) {
      if (error || !response || response.statusCode != 200) {
        return res.status(500).send("Error: " + error);
      }
      
      request({
        url: `${SERVICES_URL}/students?approved_resumes=false`,
        method: "GET",
        json: true,
        headers: {
          "Authorization": GROOT_ACCESS_TOKEN,
          "Netid": req.session.student.netid,
          "Token": req.session.student.token
        }
      }, function(s_error, s_response, s_body) {
        if (s_response && s_response.statusCode == 200 && s_body && body) {
          res.render('corporate_manager', {
            unapproved_resumes: s_body.data,
            job_listings: body.data,
            authenticated: true,
            dates: {
              "one day": moment().subtract('1', 'days').format("YYYY-MM-DD"),
              "one week": moment().subtract('1', 'weeks').format("YYYY-MM-DD"),
              "one month": moment().subtract('1', 'months').format("YYYY-MM-DD"),
              "three months": moment().subtract('3', 'months').format("YYYY-MM-DD"),
              "six months": moment().subtract('6', 'months').format("YYYY-MM-DD"),
              "one year": moment().subtract('1', 'years').format("YYYY-MM-DD")
            },
            dates_default: "three months"
          });
        } else {
          res.status(500).send(s_error);
        }
      });
    });
  });

  app.get('/corporate/students/:date', function(req, res) {
    if (!req.session.roles.isCorporate) {
      return res.redirect('/intranet');
    }

    request({
      url: `${SERVICES_URL}/students`,
      method: "GET",
      json: true,
      qs: {
        last_updated_at: req.params.date
      },
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Netid": req.session.student.netid,
        "Token": req.session.student.token
      },
      body: req.body
    }, function(error, response, body) {
      if (!response || error) {
        return res.status(500).send(error);
      }
      res.status(response.statusCode).send(body);
    });
  });

  app.get('/corporate/accounts', function(req, res) {
    if (!req.session.roles.isCorporate) {
      res.redirect('/intranet');
    }

    request({
      url: `${SERVICES_URL}/recruiters`,
      method: "GET",
      json: true,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Netid": req.session.student.netid,
        "Token": req.session.student.token
      },
    }, function(error, response, body) {
      if (!error && response && response.statusCode == 200 && body) {
        res.render('account_manager', {
          recruiters: body.data,
          authenticated: true,
          recruiter_types: utils.sponsorsScope.recruiter,
          errors: req.flash('error'),
          messages: req.flash('success')
        });
      } else {
        res.status(500).send(body);
      }
    });
  });

  app.post('/corporate/accounts', function(req, res) {
    if (!req.session.roles.isCorporate) {
      res.redirect('/intranet');
    }

    var payload = req.body;
    payload["email"] = "corporate@acm.illinois.edu";

    request({
      url: `${SERVICES_URL}/recruiters`,
      method: "POST",
      json: true,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Netid": req.session.student.netid,
        "Token": req.session.student.token
      },
      body: payload
    }, function(error, response, body) {
      if (body && body.error == null) {
        req.flash('success', body.message);
        return res.redirect('/corporate/accounts');
      } else if (body && body.message == null) {
        req.flash('error', body.error || 'An unexpected error occurred');
        return res.redirect('/corporate/accounts/' + req.params.recruiterId + '/invite');
      }

      return res.redirect('/corporate/accounts');
    });
  });

  app.get('/corporate/accounts/:recruiterId/invite', function(req, res) {
    if (!req.session.roles.isCorporate) {
      return res.redirect('/intranet');
    }

    request({
      url: `${SERVICES_URL}/recruiters/` + req.params.recruiterId + `/invite`,
      method: "GET",
      json: true,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Netid": req.session.student.netid,
        "Token": req.session.student.token
      },
      qs: {
        username: req.session.username
      }
    }, function(error, response, body) {
      if (response.statusCode != 200) {
        res.status(response.statusCode).send(body.error);
      } else if (body.data == null || body.data.recruiter == null || body.data.recruiter.invited) {
        return res.redirect('/corporate/accounts');
      }

      res.render('recruiter_invite', {
        authenticated: true,
        emailTemplate: body.data,
        from_email: req.session.student.email,
        recruiter: body.data.recruiter,
        errors: req.flash('error')
      });
    });
  });

  app.post('/corporate/accounts/:recruiterId/invite', function(req, res) {
    if (!req.session.roles.isCorporate) {
      return res.redirect('/intranet');
    }

    var payload = req.body;
    payload["email"] = req.session.student.email;

    request({
      url: `${SERVICES_URL}/recruiters/` + req.params.recruiterId + `/invite`,
      method: "POST",
      json: true,
      body: payload,
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Netid": req.session.student.netid,
        "Token": req.session.student.token
      },
    }, function(error, response, body) {
      if (body && body.error == null) {
        req.flash('success', body.message);
        return res.redirect('/corporate/accounts');
      } else if (body && body.message == null) {
        req.flash('error', body.error || 'An unexpected error occurred');
        return res.redirect('/corporate/accounts/' + req.params.recruiterId + '/invite');
      }

      return res.redirect('/corporate/accounts');
    });
  });

  app.put('/corporate/students/:netid/approve', function(req, res) {
    if (!req.session.roles.isCorporate) {
      return res.redirect('/intranet');
    }

    var absResumePath = path.resolve(__dirname + '/../../views/_partials/unapproved_resumes.ejs');
    request({
      url: `${SERVICES_URL}/students/` + req.params.netid + `/approve`,
      method: "PUT",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Netid": req.session.student.netid,
        "Token": req.session.student.token  
      },
      json: true,
      body: {}
    }, function(error, response, body) {
      if (response && response.statusCode == 200 && body) {
        res.status(200).send(ejs.render("<%- include('" + absResumePath + "') %>", { unapproved_resumes : body.data } ));
      } else {
        res.status(response.statusCode).send(body.error);
      }
    });
  });

  app.delete('/corporate/students/:netid', function(req, res) {
    if (!req.session.roles.isCorporate) {
      return res.redirect('/intranet');
    }

    var absResumePath = path.resolve(__dirname + '/../../views/_partials/unapproved_resumes.ejs');
    request({
      url: `${SERVICES_URL}/students/` + req.params.netid,
      method: "DELETE",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Netid": req.session.student.netid,
        "Token": req.session.student.token  
      },
      json: true,
      body: {}
    }, function(error, response, body) {
      if (response && response.statusCode == 200 && body) {
        res.status(200).send(ejs.render("<%- include('" + absResumePath + "') %>", { unapproved_resumes : body.data } ));
      } else {
        res.status(response.statusCode).send(body.error);
      }
    });
  });

  app.put('/corporate/jobs/:jobId/approve', function(req, res) {
    if (!req.session.roles.isCorporate) {
      res.redirect('/intranet');
    }
    
    var absJobPath = path.resolve(__dirname + '/../../views/_partials/unapproved_jobs.ejs');
    request({
      url: `${SERVICES_URL}/jobs/` + req.params.jobId + `/approve`,
      method: "PUT",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Netid": req.session.student.netid,
        "Token": req.session.student.token  
      },
      json: true,
      body: {}
    }, function(error, response, body) {
      if (response && response.statusCode == 200 && body) {
        res.status(200).send(ejs.render("<%- include('" + absJobPath + "') %>", { job_listings : body.data } ));
      } else {
        res.status(response.statusCode).send(body.error);
      }
    });
  });

  app.delete('/corporate/jobs/:jobId', function(req, res) {
    if (!req.session.roles.isCorporate) {
      return res.redirect('/intranet');
    }

    var absJobPath = path.resolve(__dirname + '/../../views/_partials/unapproved_jobs.ejs');
    request({
      url: `${SERVICES_URL}/jobs/` + req.params.jobId,
      method: "DELETE",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Netid": req.session.student.netid,
        "Token": req.session.student.token  
      },
      json: true,
      body: {}
    }, function(error, response, body) {
      if (response && response.statusCode == 200 && body) {
        res.status(200).send(ejs.render("<%- include('" + absJobPath + "') %>", { job_listings : body.data } ));
      } else {
        res.status(response.statusCode).send(body.error);
      }
    });
  });

  app.get('/corporate/accounts/:recruiterId', function(req, res) {
    if (!req.session.roles.isCorporate) {
      return res.redirect('/intranet');
    }

    request({
      url: `${SERVICES_URL}/recruiters/` + req.params.recruiterId,
      method: "GET",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Netid": req.session.student.netid,
        "Token": req.session.student.token  
      },
      json: true
    }, function(error, response, body) {
      if (response && response.statusCode == 200 && body) {
        res.render('edit_recruiter', {
          authenticated: true,
          recruiter: body.data,
          recruiter_types: utils.sponsorsScope.recruiter,
          errors: req.flash('error')
        });
      } else {
        res.status(response.statusCode).send(body.error);
      }
    });
  });

  app.post('/corporate/accounts/reset', function(req, res) {
    if (!req.session.roles.isCorporate) {
      res.redirect('/intranet');
    }

    request({
      url: `${SERVICES_URL}/recruiters/reset`,
      method: "POST",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Netid": req.session.student.netid,
        "Token": req.session.student.token  
      },
      json: true,
      body: {}
    }, function(error, response, body) {
      if (!body.error && body.message) {
        req.flash('success', body.message);
      } else if (body.error && !body.message) {
        req.flash('error', body.error);
      }

      res.redirect('/corporate/accounts');
    });
  });

  app.post('/corporate/accounts/:recruiterId', function(req, res) {
    if (!req.session.roles.isCorporate) {
      res.redirect('/intranet');
    }

    request({
      url: `${SERVICES_URL}/recruiters/` + req.params.recruiterId,
      method: "PUT",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Netid": req.session.student.netid,
        "Token": req.session.student.token  
      },
      json: true,
      body: req.body
    }, function(error, response, body) {
      if (body.error == null && body.message != null) {
        req.flash('success', body.message);
        return res.redirect('/corporate/accounts');
      }
      
      res.render('edit_recruiter', {
        authenticated: true,
        recruiter: req.body,
        recruiter_types: utils.sponsorsScope.recruiter,
        errors: body.error
      });
    });
  });

  app.put('/corporate/accounts/:recruiterId/renew', function(req, res) {
    if (!req.session.roles.isCorporate) {
      return res.redirect('/intranet');
    }

    var absRecruiterPath = path.resolve(__dirname + '/../../views/_partials/recruiters.ejs');
    request({
      url: `${SERVICES_URL}/recruiters/` + req.params.recruiterId + `/renew`,
      method: "PUT",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Netid": req.session.student.netid,
        "Token": req.session.student.token  
      },
      json: true,
      body: {}
    }, function(error, response, body) {
      if (response && response.statusCode == 200 && body) {
        res.status(200).send(ejs.render("<%- include('" + absRecruiterPath + "') %>", { recruiters : body.data } ));
      } else {
        res.status(response.statusCode).send(body.error);
      }
    });
  });

  app.delete('/corporate/accounts/:recruiterId', function(req, res) {
    if (!req.session.roles.isCorporate) {
      return res.redirect('/intranet');
    }

    var absRecruiterPath = path.resolve(__dirname + '/../../views/_partials/recruiters.ejs');
    request({
      url: `${SERVICES_URL}/recruiters/` + req.params.recruiterId,
      method: "DELETE",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Netid": req.session.student.netid,
        "Token": req.session.student.token  
      },
      json: true,
      body: {}
    }, function(error, response, body) {
      if (response && response.statusCode == 200 && body) {
        res.status(200).send(ejs.render("<%- include('" + absRecruiterPath + "') %>", { recruiters : body.data } ));
      } else {
        res.status(response.statusCode).send(body.error);
      }
    });
  });

  app.post('/corporate/students/remind', function(req, res) {
    if (!req.session.roles.isCorporate) {
      return res.redirect('/intranet');
    }

    request({
      url: `${SERVICES_URL}/students/remind`,
      method: "POST",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Netid": req.session.student.netid,
        "Token": req.session.student.token  
      },
      body: {
        last_updated_at: req.body.lastUpdatedAt
      },
      json: true
    }, function(error, response, body) {
      if (!body.error && body.message) {
        req.flash('success', body.message);
      } else if (body.error && !body.message) {
        req.flash('error', body.error);
      }

      res.redirect('/corporate/students/remind');
    });
  });

  app.get('/resumes/new', function(req, res) {
    if (req.session.roles.isStudent) {
      request({
        url: `${SERVICES_URL}/students/` + req.session.student.netid,
        method: "GET",
        json: true,
        headers: {
          "Authorization": GROOT_ACCESS_TOKEN
        },
        body: {}
      }, function(error, response, body) {
        if (body && body.data) {
          // Format graduation date into same format as how it should be displayed
          body.data.graduation_date = moment(body.data.graduation_date).format('MMMM YYYY');
          utils.sponsorsScope.student = body.data;
        }
        var error_message;
        if (response && response.statusCode != 200) {
          error_message = (body && body.error) ? body.error : error;
        }

        return res.render('resume_book', {
          authenticated: utils.isAuthenticated(req),
          job: utils.sponsorsScope.job,
          degree: utils.sponsorsScope.degree,
          grad: utils.sponsorsScope.grad,
          student: utils.sponsorsScope.student,
          success: null,
          error: error_message
        });
      });
    }

    utils.sponsorsScope.student = {};
    return res.render('resume_book', {
      authenticated: utils.isAuthenticated(req),
      job: utils.sponsorsScope.job,
      degree: utils.sponsorsScope.degree,
      grad: utils.sponsorsScope.grad,
      student: utils.sponsorsScope.student,
      success: req.flash('success'),
      error: req.flash('error')
    });
  });

  app.post('/resumes/new', function(req, res) {
      request({
          url: `${SERVICES_URL}/students`,
          method: "POST",
          headers: {
              "Authorization": GROOT_ACCESS_TOKEN
          },
          json: true,
          body: req.body
      }, function(err, response, body) {
        // Because the resume needed to be serialized, this should return json instead (to serialize_resume.js).
        res.status(response.statusCode).send(body);
      });
  });

  app.get('/corporate/resumes', function(req, res) {
    if(!(req.session.roles.isCorporate || (req.session.roles.isRecruiter && req.session.recruiter.is_sponsor))) {
      res.redirect('/sponsors/login');
    }

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
        for (var resume of body.data) {
          resume.graduation_date = utils.formatGraduationDate(resume.graduation_date);
        }
        
        res.render('resume_filter', {
          authenticated: utils.isAuthenticated(req),
          job: utils.sponsorsScope.job,
          degree: utils.sponsorsScope.degree,
          grad: utils.sponsorsScope.grad,
          student: utils.sponsorsScope.student,
          resumes: body.data,
          defaults: {}
        });
      } else {
        res.status(500).send(body);
      }
    });
  });

  app.post('/corporate/resumes', function(req, res) {
    if(!(req.session.roles.isCorporate || (req.session.roles.isRecruiter && req.session.recruiter.is_sponsor))) {
      return res.redirect('/sponsors/login');
    }

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
      headers: headers,
      qs: {
        name: req.body.name,
        graduationStart: req.body.gradYearStart,
        graduationEnd: req.body.gradYearEnd,
        netid: req.body.netid,
        degree_type: req.body.degreeType,
        job_type: req.body.jobType,
      }
    }, function(error, response, body) {
      if (response && response.statusCode == 200) {
        for (var resume of body.data) {
          resume.graduation_date = utils.formatGraduationDate(resume.graduation_date);
        }

        res.render('resume_filter', {
          authenticated: utils.isAuthenticated(req),
          job: utils.sponsorsScope.job,
          degree: utils.sponsorsScope.degree,
          grad: utils.sponsorsScope.grad,
          student: utils.sponsorsScope.student,
          resumes: body.data,
          defaults: req.body
        });
      } else {
        res.status(500).send(body);
      }
    });
  });

  app.post('/sponsors/login', function(req, res) {
    request({
      url: `${SERVICES_URL}/recruiters/login`,
      method: "POST",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN
      },
      json: true,
      body: req.body
    }, function(err, response, body) {
      if (!err && response && response.statusCode == 200) {
        // Contains JWT token
        req.session.recruiter = body.data;

        req.session.username = body.data.first_name;
        req.session.roles.isRecruiter = true;
        
        return res.redirect('/intranet');
      }
      res.render('recruiter_login', {
        authenticated: false,
        errors: body.error
      });
    });
  });

  app.post('/sponsors/reset_password', function(req, res) {
    if (utils.isAuthenticated(req)) {
      return res.redirect('intranet');
    }

    // To send to recruiters service to send an email from the appropriate account
    var payload = req.body;
    payload["email"] = "corporate@acm.illinois.edu";

    request({
      url: `${SERVICES_URL}/recruiters/reset_password`,
      method: "POST",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN
      },
      json: true,
      body: payload
    }, function(error, response, body) {
      if (response.statusCode != 200 || body.error) {
        req.flash('error', body.error || "Something went wrong...")
      }
      else {
        req.flash('success', body.message);
      }
      res.redirect('/sponsors/reset_password');
    });
  });

  app.post('/sponsors/jobs', function(req, res) {
    request({
      url: `${SERVICES_URL}/jobs`,
      method: "POST",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN
      },
      json: true,
      body: req.body
    }, function(err, response, body) {
      if (response.statusCode != 200 || body.error) {
        req.flash('error', body.error || "An unexpected error occurred");
      }
      else {
        req.flash('success', body.message);
      }
      res.redirect('/sponsors/jobs');
    });
  });

  app.get('/jobs', function(req, res) {
    if (!utils.isAuthenticated(req)) {
      res.redirect('/login');
    }

    request({
      url: `${SERVICES_URL}/jobs`,
      method: "GET",
      headers: {
        "Authorization": GROOT_ACCESS_TOKEN,
        "Netid": req.session.student.netid,
        "Token": req.session.student.token
      },
      json: true,
      qs: {
        approved: true
      }
    }, function(error, response, body) {
      res.render('job_index', {
        authenticated: true,
        jobs: body.data
      });
    });
  });
}