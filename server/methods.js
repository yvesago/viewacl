
var Vlan = Meteor.npmRequire('parseacl');

Meteor.methods({
    'getVlan': function getVlan(data, dns) {
        var vlan = Async.runSync(function(done) {
            data = data.split("\n");

            var j = [];
            Configs.find({}, {sort: {rank: 1}}).forEach(function(d) {
                j.push({'reg':d.regex,'com':d.desc,'color':d.color});
            }); 
            var conf = {'fullPolicy' : j};

            var v = new Vlan(conf); 
            v.Parse(data);

            v.newExtNet = [];

            // Post traitement
            // Create or update internal networks titles
             _.each(v.intNetworks, function(n) {
                 if (! n.net) return;
                 var inNet = Networks.findOne({net : n.net.base + '/' + n.net.bitmask})
                 if (!inNet) {
                 // console.log('CREATE');
                  Networks.insert({
                    net: n.net.base + '/' + n.net.bitmask,
                    vlan: v.name,
                    title: v.desc,
                    type: n._type
                    })
                 }
                 else {
                  //console.log('UPDATE');
                      Networks.update({_id:inNet._id},
                      {$set: {
                        vlan: v.name,
                        title: v.desc,
                        type: n._type
                        }})
                };

             });

            // Update external networks title
             _.each(v.extNet, function(n) {
                 var extNet = Networks.findOne({net : n.net.base + '/' + n.net.bitmask})
                 var newNet = n;
                 if (extNet) {
                     newNet.title = extNet.vlan + ' - ' + extNet.title
                     newNet._type = extNet.type
                 }
                 else {
                     newNet.title = n.net.base + '/' + n.net.bitmask
                 };
                 v.newExtNet.push(newNet);
             });


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
