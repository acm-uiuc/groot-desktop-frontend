var moment = require('moment');

var exports = module.exports = {};

exports.formatGraduationDate = function(date) {
  return moment(date).format("MMMM Y");
}

exports.resultsPerPage = 25;

exports.getPage = function(results, page) {
  var start_idx = page * exports.resultsPerPage;
  if(start_idx >= results.length){
    return []
  }
  var res = results.slice(start_idx, Math.min(start_idx + exports.resultsPerPage, results.length));
  return res
}

exports.maxPage = function(results) {
  return Math.ceil(results.length / exports.resultsPerPage);
}