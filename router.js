
////////////////////////////////////////////////////////////////////
// Routing
//

var filters = {

  /**
   * ensure user is logged in 
   */
  authenticate: function (pause) {
    var user;
    console.log('authenticate:');
    Meteor.subscribe('users');
    if (Meteor.loggingIn()) {
      this.render('loading');
    } 
    else {
      user = Meteor.user();
      if (user) { 
       this.next(); 
       }
       else {
        console.log('filter: signin');
        this.render('signin');
        };
   };
 }, 
 // force CAS auth
 forcecas: function (pause) {
     Meteor.loginWithCas();
     Router.go('start');
     return;
 },
 wait: function () {
      this.render('loading');
      this.subscribe('messages').wait();
      this.subscribe('vlans').wait();
      this.subscribe('configs').wait();
      this.next();
 }
};

var method = { 
  waitID : function () {
    var content = Vlans.findOne({_id: this.params._id});
    if (content)
      Meteor.call('getVlan', content, Session.get('DNS'), function(e, res){
                    Session.set('objVlan', res);
                    Session.set('waiting', false);
              });
      this.next();
  },
  waitExtID : function () {
    var content = Vlans.findOne({'extId': this.params._id});
    if (content)
      Meteor.call('getVlan', content, Session.get('DNS'), function(e, res){
                    Session.set('objVlan', res);
                    Session.set('waiting', false);
              });
      this.next();
  }
};

Router.configure({
//  layout: 'start',
  loadingTemplate: 'loading',
  notFoundTemplate: 'not_found',
});


Router.map(function () {
  this.route('start', {
    path: '/',
    onBeforeAction: [filters.authenticate,filters.wait],
//    data: function() {return Vlans.find()}
  });
// REST  
  this.route('/api/vlans/createorupdate', function() {
    var access = Meteor.settings.RESTaccess;
    var headers = this.request.headers;
    var token = headers['x-auth-token'];
    var ip = headers['x-forwarded-for'];
    if (ip) check(ip, String);
    if (token) check(token, String);

    if ( token != access.token || access.ips.indexOf(ip) === -1 ) {
      this.response.statusCode = 401;
      this.response.setHeader("Content-Type", "application/json");
      this.response.end('401: AccessDenied');
      return;
    };

    var data = this.request.body;
    var extId = data['id'];
    var nom = data.nom;
    var routeur = data.routeur;
    var content = data.content;
    var owners = new Array;
    (typeof data.owners === 'string') ? owners.push(data.owners): owners = data.owners;
    check(extId, String);
    check(nom, String);
    check(routeur, String);
    check(content, String);
    check(owners, Array);

    var vlan = Vlans.findOne({'extId': extId});

    var response;
    if (vlan) {
      response = 'update';
      Vlans.update({
        "_id": vlan._id }, {
        $set: {
           "nom": nom,
           "routeur": routeur,
           "content" : content,
           "owner" : owners,
           "modified": new Date,
           "modifiedBy": 'REST@api'
        }} ,{"getAutoValues": false} );
    }
    else {
      response = 'create';
      Vlans.insert({
           "nom": nom,
           "routeur": routeur,
           "extId": extId,
           "content" : content,
           "owner" : owners,
           "created": new Date,
           "createdBy": 'REST@api'
        },{"getAutoValues": false});
    };
    this.response.statusCode = 200;
    this.response.setHeader("Content-Type", "application/json");
    this.response.setHeader("Access-Control-Allow-Origin", "*");
    this.response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    this.response.end('OK ' + response );
  }, {where: 'server'});
  // url to force a CAS auth
  this.route('cas', {
    path: '/cas',
    onBeforeAction: [filters.forcecas,filters.wait]
  });
  this.route('admin', {
    onBeforeAction: [filters.authenticate,filters.wait]
  });
  this.route('config', {
    path: '/config',
    onBeforeAction: [filters.authenticate,filters.wait],
    data: function() {return Configs.find({}, {sort: {rank: 1}})}
  });
 this.route('ViewAcl', { 
      path: '/viewacl/:_id',
      template: 'ViewAcl',
      onBeforeAction: [filters.authenticate,filters.wait,method.waitID],
      data: function() { 
           Session.set('waiting', true);
           //Session.set('objVlan', false);
           return Vlans.findOne({_id: this.params._id}); }
 });
 this.route('ViewAclREST', {
      path: '/v/:_id',
      template: 'ViewAcl',
      onBeforeAction: [filters.authenticate,filters.wait,method.waitExtID],
      data: function() {
           Session.set('waiting', true);
           //Session.set('objVlan', false);
           return Vlans.findOne({'extId': this.params._id}); }
 });
});
