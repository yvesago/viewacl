
/////////////////////////////
// Vlans model

Messages = new Meteor.Collection("messages");
Vlans = new Meteor.Collection("vlans");
Configs = new Meteor.Collection("configs");

Vlans.allow ({
    insert: function (userId, doc) {
        return (userId)
        },
    update: function (userId, doc) {
        if (userId && Roles.userIsInRole(userId, ['admin']) )
            return true;
        return (userId && _.contains(doc.owner, Meteor.user().emails[0].address) )
        },
    remove: function (userId, doc) {
        if (userId && Roles.userIsInRole(userId, ['admin']) )
            return true;
        return (userId && _.contains(doc.owner, Meteor.user().emails[0].address) )
        }
    });

Messages.allow ({
    insert: function (userId, doc) {
        if ( Roles.userIsInRole(userId, ['admin']) === false ) {
           throw new Meteor.Error(404, "Not admin");
           return false;
        }
        return true;
        },
    update: function (userId, doc) {
        if ( Roles.userIsInRole(userId, ['admin']) === false ) {
           throw new Meteor.Error(404, "Not admin");
           return false;
        }
        return true;
        },
    remove: function (userId, doc) {
        // limite par role
        if ( Roles.userIsInRole(userId, ['admin']) === false ) {
           throw new Meteor.Error(404, "Not admin");
           return false;
        }
        return true;
        },
    });

Configs.allow ({
    insert: function (userId, doc) {
        if ( Roles.userIsInRole(userId, ['admin']) === false ) {
           throw new Meteor.Error(404, "Not admin");
           return false;
        }
        return true;
        },
    update: function (userId, doc) {
        if ( Roles.userIsInRole(userId, ['admin']) === false ) {
           throw new Meteor.Error(404, "Not admin");
           return false;
        }
        return true;
        },
    remove: function (userId, doc) {
        // limite par role
        if ( Roles.userIsInRole(userId, ['admin']) === false ) {
           throw new Meteor.Error(404, "Not admin");
           return false;
        }
        return true;
        },
    });

var Schemas = {};

Schemas.messages = new SimpleSchema({
    mNom: {
         type: String,
         label: 'Label',
         max: 20,
         unique: true
         },
    mContent: {
         type: String,
         label: "Contenu",
         max: 20000,
         optional: true,
         autoform: {
             rows: 10       // for textarea field
         }
         }
});

Schemas.configs = new SimpleSchema({
    regex: {
         type: String,
         label: 'RegEx',
         max: 200,
         unique: true
         },
    desc: {
         type: String,
         label: "Conseil",
         max: 200,
         optional: true,
         },
    color: {
         type: String,
         label: "Couleur",
         allowedValues: ['green','orange','red'],
         autoform: {
          options: "allowed",
          firstOption: 'Choisir' 
         },
         optional: true
         },
    score: {
         type: Number,
         label: "Importance",
         optional: true,
         defaultValue: 0
         },
    rank : {
         type: Number,
         decimal: true,
         label: "Ordre d'application",
         optional: true,
         defaultValue: 0
    }
});


Schemas.vlans = new SimpleSchema({
    nom: {
         type: String,
         label: 'Routeur et Vlan : description' + ' *',
         max: 200,
         unique: false
         },
    extId: {
         type: String,
         max: 40,
         optional: true,
         unique: true
         },
    score: {
        type: Number,
        optional: true,
        },
    owner:{
         type: [String],
         label: "Contact*",
         optional: true,
         minCount: 1,
         min: 4,
         regEx: SimpleSchema.RegEx.Email,
         autoValue: function () {
           if (this.isInsert) {
            if (!this.operator) {
                return [Meteor.user().emails[0].address]
            }
            else {
               return {$push: Meteor.user().emails[0].address};
            } 
           }
         }
         },
    content: {
         type: String,
         label: "Contenu" + ' *',
         max: 40000,
       //  optional: true,
         autoform: {
             rows: 30       // for textarea field
         }
         },
    created: {
        type: Date,
        label: "Created Date",
        autoValue: function () {
            if (this.isInsert) {
              return new Date;
            } else {
              this.unset();
            }
        }
    },
    createdBy: {
        type: String,
        label: "Created By",
        autoValue: function () {
            if (this.isInsert) {
              return Meteor.user().emails[0].address;
            } else {
              this.unset();
            }
        }
    },
    modified: {
        type: Date,
        label: "Modified Date",
        optional: true,
        autoValue: function () {
            if (this.isUpdate && ! this.field("score").isSet) {
              return new Date;
            } else {
              this.unset();
            } 
        }
    },
    modifiedBy: {
        type: String,
        label: "Modified By",
        optional: true,
        autoValue: function () {
            if (this.isUpdate && ! this.field("score").isSet) {
              return Meteor.user().emails[0].address;
            } else {
              this.unset();
            } 
        }
    },
});
/*
    ips: {
        type: [String],
        label: "IPs sources*",
        regEx: ipv46test,
        optional: true,
        defaultValue: [],
        minCount: 1,
        },
    _chgips: {              // as ips are mandatory _chgips allow to show ips
        type: [String],     // changed requests in history
        label: "IPs changed",
        regEx: ipv46test,
        optional: true,
        defaultValue: []
        },
    updatesHistory: {
        type: [Object],
        optional: true,
        autoValue: function() {
          var ips = this.field("_chgips");
          var ipsorig = this.field("ips");
          var owner = this.field("owner");
          var status = this.field("status");
          var dataperso = this.field("dataperso");
          if (status.isSet || dataperso.isSet || ipsorig.isSet) {
            if (this.isInsert) {
              return [{
                  date: new Date,
                  by: Meteor.user().emails[0].address,
                  content: 'Demande : IPs ' + ipsorig.value.join(', ') + ((dataperso.isSet)? ' + Dataperso: ' + dataperso.value.join(', '): '')
                }];
            } else {
              var text = (statusLabel[status.value] || '');
              text = text + ' ' + ((dataperso.isSet && dataperso.value)?' + Demande (dataperso: ' + dataperso.value.join(', ') + ')': '');
              text = text + ' ' + ((ips.isSet)?'(ips: ' + ips.value.join(', ') + ')': '');
              return {
                $push: {
                  date: new Date,
                  by: Meteor.user().emails[0].address,
                  content: text
                }
              };
            }
          } else {
            this.unset();
          } 
        }
      },
  'updatesHistory.$.date': {
    type: Date,
    optional: true
  },
  'updatesHistory.$.content': {
    type: String,
    optional: true
  },
  'updatesHistory.$.by': {
    type: String,
    optional: true
  },
     
});
*/

/////////////////////////////


Configs.attachSchema(Schemas.configs);
Messages.attachSchema(Schemas.messages);
Vlans.attachSchema(Schemas.vlans);
