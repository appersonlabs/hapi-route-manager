var Joi = require('joi');

var ListApps = {
    method: 'GET',
    handler: function(req, reply) {
        reply({success: true});
    }
};

exports.GET = ListApps;

var AddApps = {
    config: {
        validate: {
            payload: Joi.object().keys({
                app: Joi.string().required()
            })
        }
    },
    handler: function(req, reply) {
        reply({success: true});
    }
};

exports.POST = AddApps;
