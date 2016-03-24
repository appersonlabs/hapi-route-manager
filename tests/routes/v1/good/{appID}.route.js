var ListApps = {
    method: 'POST',
    path: '/build',
    handler: function(req, reply) {
        reply({success: true});
    }
};

exports.POST = ListApps;
