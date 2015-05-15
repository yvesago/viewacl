
// Server side collections
// for server side cache

Networks = new Meteor.Collection("networks");

var ServerSchemas = {};

ServerSchemas.networks = new SimpleSchema({
    net: {
         type: String,
         max: 50,
         unique: true
         },
    title: {
         type: String,
         max: 100,
         },
    vlan: {
         type: String,
         max: 20,
         optional: true
         },
    type: { // for ServPub, ServInt, ...
         type: String,
         max: 20,
         optional: true
         },
});

Networks.attachSchema(ServerSchemas.networks);
