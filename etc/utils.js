var moment = require('moment');

var exports = module.exports = {};

exports.formatGraduationDate = function(date) {
  return moment(date).format("MMMM Y");
}
