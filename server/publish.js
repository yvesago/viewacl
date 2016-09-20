////////////////////////////////////////////////////////////////////
// Publish
//

console.log('Publish ');


// admin can view all vlans
Meteor.publish("vlans", function (){
  var user = Meteor.users.findOne({_id:this.userId});
  if (user) {
      if (Roles.userIsInRole(user, ["admin"]) || Roles.userIsInRole(user, ['reader']) ) {
           //  console.log('   for admin  ',user.emails[0].address);
          return Vlans.find({},{fields: {'content':0}})
      }
      else {
           //  console.log('   for user  ',user.emails[0].address);
          //return Vlans.find({$or:[{owner: user.emails[0].address}, {nom: Meteor.settings.public.appName}]});
          return Vlans.find({owner: user.emails[0].address});
          
          }
  };
  this.stop();
  return;

});

// publish vlan by id
Meteor.publish("vlanByID", function (vlanID){
  var user = Meteor.users.findOne({_id:this.userId});
  if (user) {
      if (Roles.userIsInRole(user, ["admin"]) || Roles.userIsInRole(user, ['reader']) ) {
          return Vlans.find({_id: vlanID})
      }
      else {
          return Vlans.find({_id: vlanID , owner: user.emails[0].address});
          }
  };
  this.stop();
  return;

});

// Publish all roles
Meteor.publish(null, function (){
      return Meteor.roles.find()
});

// Publish all messages
Meteor.publish('messages', function (){
      return Messages.find()
});
// Publish config
Meteor.publish('configs', function (){
      return Configs.find()
});

// Authorized users can manage user accounts
Meteor.publish("users", function () {
  var user = Meteor.users.findOne({_id:this.userId});

  if (Roles.userIsInRole(user, ["admin","manage-users"])) {
    // console.log('publishing users', this.userId)
    return Meteor.users.find({}, {fields: {emails: 1, profile: 1, roles: 1}});
  }

  this.stop();
  return;
});

