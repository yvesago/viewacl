
var Vlan = Meteor.npmRequire('parseacl');
var Nmask = Meteor.npmRequire('netmask').Netmask;

Meteor.methods({
    'getVlan': function getVlan(data, dns) {
        var vlan = Async.runSync(function(done) {
            var content = data.content.split("\n");

            var j = [];
            Configs.find({}, {sort: {rank: 1}}).forEach(function(d) {
                j.push({'reg':d.regex,'com':d.desc,'color':d.color,'score':d.score});
            }); 
            var conf = {'dnsTimeout': 10, 'fullPolicy' : j};
            if (Meteor.settings.dnsTimeout) conf.dnsTimeout = Meteor.settings.dnsTimeout;

            var v = new Vlan(conf); 
            v.Parse(content);
            // Update score
            Vlans.update({'_id':data._id},
                 {$set: { 'score': v.score }});

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
                     // Search if base is a subnet of a known network
                     var searchNet = n.net.base.match(/^(\d+\.\d+)\./);
                     var reg = new RegExp('^' + searchNet[1] );
                     var knownNet = Networks.find({'net': {$regex: reg}}).fetch();
                      knownNet.forEach(function(k) {
                        var block = new Nmask(k.net);
                        if (block.contains(n.net)) {
                            newNet.title = k.vlan + ' - ' + k.title + " (Subnet)";
                            newNet._type = k.type;
                            }
                      });
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
