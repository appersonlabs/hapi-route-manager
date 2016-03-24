var walk = require('walk'),
    path = require('path'),
    verbs = require('http-verbs');


function objectToRoutes(apiVersion, cleanRoute, routeVerbObject) {
    var routes = [];

    Object.keys(routeVerbObject).forEach((verb) => {
        if(!verbs[verb]) return; // only allow legit http methods in :)

        var routeObject = routeVerbObject[verb];

        // Used for SDK creation by many plugins ;)
        var nickname;
        if (!routeObject.nickname) {
            nickname = cleanRoute.replace(/\/([a-z])/g, function(g) { return g[1].toUpperCase(); });
        } else {
            nickname = routeObject.nickname;
        }

        routeObject.config = routeObject.config || {};
        routeObject.config.plugins = routeObject.config.plugins || {};
        routeObject.config.plugins['hapi-swaggered'] = {
            custom: {}
        };

        routeObject.config.plugins['hapi-swaggered'].custom['x-swagger-js-method-name'] = nickname;

        routeObject.method = verb;
        routeObject.apiVersion = apiVersion;

        routes.push(routeObject);
    });

    return routes
}

exports.register = function(server, options, next) {
    var versionRegex = /^[v][0-9]+?$/g;

    var versions = {};

    walk.walkSync(options.directory, {
        listeners: {
            file: function(root, fileStats, nextFile) {
                if (fileStats.name.indexOf('.route.js') !== -1) {

                    try {
                        var route = `${root.replace(options.directory, '')}/${fileStats.name.replace('.route.js', '')}`;
                        var apiVersion = route.split('/')[1].match(versionRegex)[0];
                        var cleanRoute = route.replace('/' + apiVersion + '/', ''); // aka just no version info
                        var filename = root + '/' + fileStats.name;
                        var routeObject = require(path.resolve(filename));
                    } catch(e) {
                        // $lab:coverage:off$
                        next(e);
                        // $lab:coverage:on$

                    }

                    // move from the hapi std config to the http verb based export object
                    if(routeObject.handler && routeObject.method) {
                        routeObject = {
                            [routeObject.method]: routeObject
                        };
                    }

                    if (!versions[apiVersion]) {
                        versions[apiVersion] = [];
                    }

                    var routes = objectToRoutes(apiVersion, cleanRoute, routeObject);



                    try {
                        routes.forEach((routeObj) => {
                            routeObj.filename = path.resolve(filename);
                            routeObj.path = path.join(route, routeObj.path || '')
                        });

                        versions[apiVersion] = versions[apiVersion].concat(routes);
                    } catch(e) {
                        // $lab:coverage:off$
                        next(e);
                        // $lab:coverage:on$
                    }
                }

                nextFile();
            }
        }
    });

    Object.keys(versions).forEach(function(version) {
        versions[version].forEach(function(route) {
            if (route.config.tags) {
                route.config.tags = route.config.tags.concat([ 'api', route.apiVersion ]);
            } else {
                route.config.tags = [ 'api', route.apiVersion ];
            }

            server.route({
                method: route.method,
                path: route.path,
                handler: route.handler,
                config: route.config
            });
        });
    });

    return next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};
