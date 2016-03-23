"use strict";

const Code = require('code');
const Lab = require('lab');
const Hapi = require('hapi');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;

lab.experiment('Good Stuff', () => {
    let server = new Hapi.Server();
    server.connection({ port: 8080, labels: 'a' });

    lab.test('Plugin should register', (done) => {
        server.register({
            register: require('../index.js'),
            options: {
                directory: "./tests/routes",
                debug: false
            }
        }, (err) => {
            var table = server.table()[0].table;

            expect(err).to.not.exist();
            expect(table.length).to.equal(12)
            done();
        });

    });
});
