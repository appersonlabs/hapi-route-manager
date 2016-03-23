# Hapi Route Manager

### Background
We really wanted a better way to manage both route versions and the routes themselves in larger deployments of Hapi apps

### How it works

```js
server.register({
    register: require('hapi-route-manager'),
    options: {
        directory: "./routes",
    }
})
```

Within the `./routes` directory we have a structure of:
```
routes/
├── v1/
│   └── user/
|         ├── index.route.js
|         ├── {urlParam}.route.js
|         └── stuff.route.js
│   
├── v2/
 ...
```
And thats it, no need to glue things together with 1000 require statements or having to guess at what URL leads to what code.

Then for instance inside `index.route.js` we have something like this:
```js
var ListUsers = {
    handler: function(req, reply) {
        reply({success: true});
    }
};
exports.GET = ListUsers;

var AddUser = {
    handler: function(req, reply) {
        reply({success: true});
    }
};
exports.POST = AddUser;
```

In this instance, the routes created from `index.route.js` would be:
`GET:  /v1/user`
`POST: /v1/user`
if the file were named lets say `{urlParam}.route.js` it would have created:
`GET:  /v1/user/{urlParam}`
`POST: /v1/user/{urlParam}`

Within file/folder names, any valid route path option for hapi is valid. Files without `.route.js` are ignored.

The same goes for the route definitions, every exported method uses any valid hapi config.

exported param names are any valid HTTP verb. Anything else is simply ignored.

### TODO
- More tests (our 1 test gives us 100% coverage though :shrugs:)
- Add an option for the version to be used in a version header vs URL path
- Document the rest of the features :)
