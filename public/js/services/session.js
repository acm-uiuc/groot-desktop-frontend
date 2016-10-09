app.service('Session', function () {
  this.create = function (user) {
    this.token = user.token;
    this.netid = user.name;
    this.roles = ['member'];
    this.created = user['created-date'];
    this.created = user['expiry-date'];
  };

  this.destroy = function () {
    this.token = null;
    this.firstName = null;
    this.lastName = null;
    this.netid = null;
  };

  return this;
})
