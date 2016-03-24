var ListApps = {
    method: 'POST',
    path: '/build',// URL MUST include the URL of the orig route. AKA you can add but cant take away
    handler: function(req, reply) {
        reply({success: true});
    }
};

exports.POST = ListApps;
