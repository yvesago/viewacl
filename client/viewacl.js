/*
 Set title with Meteor.settings.public.appName
 Allow to change name for test, dev, prod environments
*/
Meteor.startup(function () {
    Meteor.autorun(function () {
        document.title = Meteor.settings.public.appName;
    });
});


/* appName helper

Usage : header, inline content editing

*/
Template.registerHelper('appName', function (opts) {
        return Meteor.settings.public.appName;
});

// Event for signin  

Template.signin.events({
    'click .login-btn': function (e, t) {
        e.preventDefault();
        Meteor.loginWithCas();
    }
});


/* Helper to format dates

  Usage: 

  {{dateFormat creation_date}} 
  or
  {{dateFormat creation_date format="MMMM YYYY"}}

*/
Template.registerHelper('dateFormat', function(context, block) {
    if (window.moment) {
      var f = block.hash.format;// || "MMM DD, YYYY hh:mm:ss A";
      //return (f) ? moment(context).format(f) : moment(context).toISOString(); 
      return (context)?moment(context).format(f):' ';
    }else{
      return context;   //  moment plugin not available. return data as is.
    };
  });



/*
 Hooks
*/
AutoForm.addHooks(null, {
        onSuccess: function () {
        //  close modal form on submit;
          $('#updateVlanForm').modal('hide');
          $('#insertVlanForm').modal('hide');
          $('#updateConfigForm').modal('hide');
          $('#insertConfigForm').modal('hide');
          //this.done();
          return false;
        }
});



/* Helper to set context of content field for inline editing

 Usage :

 {{#with helpMessage n="zzz"}}
  {{content}}
 {{/with}}

*/

Template.registerHelper('helpMessage', function (opts) {
    if (!opts) return '';
    var hash = opts.hash;// (opts || {}).hash || {};

    var obj = Messages.findOne({"mNom":hash.n});
    return obj;
});


// ViewAcl rendered, helpers, events

function reload() {  
      var data = Template.currentData();
      Session.set('waiting', true);
      if ( data === null ) {return;};
      Meteor.call('getVlan', data, Session.get('DNS'), function(e, res){
          Session.set('objVlan', res);
          Session.set('waiting', false);
      });
};

Template.ViewAcl.rendered= function () {
    reload();
};

Template.registerHelper('parseLine', function (l) {
    if (!l) return '';
    if ( l.match(/out permit \w+ any/) )
        return 'red';
    return;
});

Template.registerHelper('mName', function (o) {
    if (!o) return '';
    var name = o._ip;
    var dns = Session.get('DNS');
    if ( dns )
          name = o._name;
    if (Session.get('shortName') ) {
    var shortName;
    if (shortName = name.match(/^\d+\.\d+\.\d+\.(\d+)$/))  //TODO IPv6
        name = shortName[1];
      else if (shortName = name.match(/^(.*?)\./))
        name = shortName[1];
     };
    return name;
});


Template.ViewAcl.helpers({
    getVlan : function () { return Session.get('objVlan') || []; },
    vDNS : function () { return Session.get('DNS');},
    waiting : function () { return Session.get('waiting'); },
    shortName : function () { return Session.get('shortName'); }
});

Template.ViewAcl.events ({
   'click .machine': function(e, t) {
        e.preventDefault();
        Session.set('selectedMachine',this);
        $('#viewMachine').modal('show');
    },
   'click .net': function(e, t) {
        e.preventDefault();
        Session.set('selectedMachine',this);
        $('#viewNet').modal('show');
    },
   'click .reload': function(e, t) {
        e.preventDefault();
        reload();
    },
   'click .mDNS': function(e, t) {
        e.preventDefault();
        (Session.get('DNS')) ?
            Session.set('DNS', false) :
            Session.set('DNS', true);
        reload();
    },
   'click .shortName': function(e, t) {
        e.preventDefault();
        (Session.get('shortName')) ?
            Session.set('shortName', false) :
            Session.set('shortName', true);
    },
   'click .vContent':function(e, t) {
        e.preventDefault();
        Session.set('Content-visible', true)},
   'click .mContent':function(e, t) {
        e.preventDefault();
        Session.set('Content-visible', false)},
   'click .edit .messACL': function(e, t) {
      e.preventDefault();
      Session.set("selectedDoc", this._id);
      $('#updateMessageForm').modal('show');
      },
   'click .edit .messFull': function(e, t) {
      e.preventDefault();
      Session.set("selectedDoc", this._id);
      $('#updateMessageForm').modal('show');
      }
    });

// sub templates helpers 

Template.viewMachine.helpers({
    m: function () {return Session.get('selectedMachine');
    }
});

Template.viewNet.helpers({
    m: function () {return Session.get('selectedMachine');
    }
});

Template.tContent.helpers({
     viewContent: function () {return Session.get('Content-visible')}
});


Template.updateMessageForm.helpers({
    selectedDoc: function(t) {
        return Messages.findOne(Session.get("selectedDoc"));
    }
});

// Start helpers, events
Template.start.helpers({
    data : function () {
       return Vlans.find();},
        settings: function () {
        return {
            rowsPerPage: 10,
            showFilter: true,
            useFontAwesome: false,
            showNavigation: 'auto',
            fields: [
                //{ key : 'filtre', label: 'Filtres×',  tmpl: Template.filtresTmpl}, 
                { key: 'ctl', label: ' ', tmpl: Template.actionTmpl},
                { key : 'score', label: 'Importance', sort : true},
                { key : 'nom', label: 'Nom'},
              ]
        };
    }
});

Template.updateVlanForm.helpers({
    selectedVlan: function (t) {
        return Vlans.findOne(Session.get("selectedVlan"));
    }
});

Template.start.events ({
   'click .vlanAdd': function(e, t) {
      e.preventDefault();
      Session.set("selectedVlan", null);
      $('#insertVlanForm').modal('show');
    },
   'click .vlanEdit': function(e, t) {
      e.preventDefault();
      Session.set("selectedVlan", this._id);
      $('#updateVlanForm').modal('show');
    },
   'click .aclView': function(e, t) {
      e.preventDefault();
      if (this.extId) {
        return Router.go('/v/'+this.extId); }
       else {
        return Router.go('/viewacl/'+this._id); };
    },
   'click .vlanClear': function(e, t) {
      e.preventDefault();
      var result = confirm('Confirmation');
      Session.set("selectedVlan", null);
      if ( result === true )
          Vlans.remove(this._id);
   },
   'click .edit .messMain': function(e, t) {
      e.preventDefault();
      Session.set("selectedDoc", this._id);
      $('#updateMessageForm').modal('show');
    }

});

// Config helpers, events
Template.config.helpers({
    data : function () {
       return Template.currentData();},
    jsondata : function () {
        var j = [];
        Configs.find({}).forEach(function(d) {
              j.push({'reg':d.regex,'com':d.desc,'color':d.color});
        });
        var conf = {'fullPolicy' : j};
        return(JSON.stringify(conf,null,2));}
});

Template.updateConfigForm.helpers({
    selectedConf: function(t) {
        return Configs.findOne(Session.get("selectedConf"));
    }
});


Template.config.events ({
   'click .confAdd': function(e, t) {
      e.preventDefault();
      Session.set("selectedConf", null);
      $('#insertConfigForm').modal('show');
    },
   'click .confClear': function(e, t) {
      e.preventDefault();
      var result = confirm('Confirmation');
      Session.set("selectedConf", null);
      if ( result === true )
          Configs.remove(this._id);
   },
   'click .confEdit': function(e, t) {
      e.preventDefault();
      Session.set("selectedConf", this._id);
      $('#updateConfigForm').modal('show');
    }

});

/*

 Drag and Drop list
 From
 https://github.com/meteor/meteor/tree/devel/examples/unfinished/reorderable-list
 with fixes

*/


SimpleRationalRanks = {
  beforeFirst: function (firstRank) { return firstRank - 1; },
  between: function (beforeRank, afterRank) {
      return Math.round( ((beforeRank + afterRank) / 2) * 10 ) / 10; }, // decimal round
  afterLast: function (lastRank) { return lastRank + 1; }
};

Template.config.rendered = function () {
  $(this.find('#list')).sortable({ // uses the 'sortable' interaction from jquery ui
    stop: function (event, ui) { // fired when an item is dropped
      var el = ui.item.get(0), before = ui.item.prev().get(0), after = ui.item.next().get(0);

      var newRank;
      if (!before) { // moving to the top of the list
        newRank = SimpleRationalRanks.beforeFirst(Blaze.getData(after).rank);

      } else if (!after) { // moving to the bottom of the list
        newRank = SimpleRationalRanks.afterLast(Blaze.getData(before).rank);

      } else {
        newRank = SimpleRationalRanks.between(
          Blaze.getData(before).rank,
          Blaze.getData(after).rank);
      }

      Configs.update(Blaze.getData(el)._id, {$set: {rank: newRank}});

    }
  });
};
