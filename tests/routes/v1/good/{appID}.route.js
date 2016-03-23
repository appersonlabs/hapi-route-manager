var ListApps = {
    method: 'POST',
    route: '/build',
    handler: function(req, reply) {
        reply({success: true});
    }
};

exports.POST = ListApps;
