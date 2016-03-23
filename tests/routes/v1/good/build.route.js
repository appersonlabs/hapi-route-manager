var ListApps = {
    method: 'GET',
    nickname: 'foobar',
    handler: function(req, reply) {
        reply({success: true});
    }
};

module.exports = ListApps;
