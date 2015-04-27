
var Vlan = Meteor.npmRequire('parseacl');

Meteor.methods({
    'getVlan': function getVlan(data, dns) {
        var vlan = Async.runSync(function(done) {
            data = data.split("\n");

            var j = [];
            Configs.find({}).forEach(function(d) {
                j.push({'reg':d.regex,'com':d.desc,'color':d.color});
            }); 
            var conf = {'fullPolicy' : j};

            var v = new Vlan(conf); 
            v.Parse(data);

            if(dns) {
            _.each(v.intMachines, function(i) { i.name(); });
            _.each(v.extMachines, function(i) { i.name(); });
            _.each(v.extMachines, function(i) { i.name(); });
            _.each(v.intSubNet, function(n) { 
                _.each(n.inMachine, function(i) { i.name(); })
              });
            _.each(v.intNetworks, function(n) { 
                _.each(n.inMachine, function(i) { i.name(); })
              });
            _.each(v.extNet, function(n) { 
                _.each(n.inMachine, function(i) { i.name(); })
              });
            _.each(v.extSubNet, function(n) { 
                _.each(n.inMachine, function(i) { i.name(); })
              });
            };

            done(null, v);
        });
        return vlan.result;
    }
})
