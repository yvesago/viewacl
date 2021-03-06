
// Server side collections
// for server side cache

import SimpleSchema from 'simpl-schema';


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
         optional: true
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
