var ListApps = {
    method: 'DELETE', // will be overridden to get because export is god
    handler: function(req, reply) {
        reply({success: true});
    }
};

exports.GET = ListApps;
