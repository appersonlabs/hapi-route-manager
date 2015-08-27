var walk = require("walk"),
    path = require("path");

exports.register = function(server, options, next) {
    console.log("Registering routes from " + options.directory + "...");

    var apiServer = options.select ? server.select(options.select) : server,
        lastErr = null,
        versions = {};

    walk.walkSync(options.directory, {
        listeners: {
            file: function(root, fileStats, nextFile) {
                if (fileStats.name.indexOf(".route.js") !== -1) {

                    try {
                        var filename = root + "/" + fileStats.name,
                            route = root.replace(options.directory, ""),
                            routeObject = require(path.resolve(filename)),
                            apiVersion = route.split("/")[1],
                            cleanRoute = route.replace("/" + apiVersion + "/", ""),
                            nickname;
                    } catch(e) {
                        console.log(e);
                    }

                    // append the filenames route info
                    route = route + "/" + fileStats.name.replace(".route.js", "");

                    if (!routeObject.config || !routeObject.config.nickname) {
                        if (fileStats.name.replace(".route.js", "") !== "index") {
                            cleanRoute = cleanRoute + "/" + fileStats.name.replace(".route.js", "");
                        }

                        nickname = cleanRoute.replace(/\/([a-z])/g, function(g) { return g[1].toUpperCase(); });
                    } else {
                        nickname = routeObject.config.clientName;
                        delete routeObject.config.clientName;
                    }

                    if (!versions[route]) {
                        versions[route] = [];
                    }

                    routeObject.config = routeObject.config || {};
                    routeObject.config.plugins = routeObject.config.plugins || {};
                    routeObject.config.plugins["hapi-swaggered"] = {
                        custom: {}
                    };
                    if(nickname) {
                        routeObject.config.plugins["hapi-swaggered"].custom['x-swagger-js-method-name'] = nickname;
                    }
                    routeObject.apiVersion = apiVersion;
                    routeObject.filename = path.resolve(filename);
                    versions[route].push(routeObject);
                }

                nextFile();
            }
        }
    });
    console.log(Object.keys(versions).length + " routes found. Loading now...");

    Object.keys(versions).forEach(function(urlPath) {
        versions[urlPath].forEach(function(route, index, routes) {
            try {
                if (route.config.tags) {
                    route.config.tags = route.config.tags.concat([ "api", route.apiVersion ]);
                } else {
                    route.config.tags = [ "api", route.apiVersion ];
                }
                server.route({
                    method: route.method,
                    path: urlPath,
                    handler: route.handler,
                    config: route.config
                });
            } catch (e) {
                console.log(e);
                var error = "[ERROR] A duplicate route was detected with a " + route.method;
                error += " request to " + path.join(urlPath, route.path || "")
                error += " in the file " + route.filename;

                throw error;
            }
        });
    });

    return next();
};

exports.register.attributes = {
    pkg: require("./package.json")
};
