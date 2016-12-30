'use strict'

const Hapi = require('hapi');
const Request = require('request');
const Vision = require('vision');
const Handlebars = require('handlebars');

const server = new Hapi.Server();

server.connection({
	host: '127.0.0.1',
	port: 3000
});

server.register(Vision, (err) => {
	server.views({
		engines: {
			html: Handlebars
		},
		relativeTo: __dirname,
		path: './views',
	});
});

// Show teams standings
server.route({
	method: 'GET',
	path: '/',
	handler: function (request, reply) {
		Request.get('http://api.football-data.org/v1/competitions/438/leagueTable', function (error, response, body) {
			if (error) {
				throw error;
			}

			let data = JSON.parse(body);
			reply.view('index', { result: data });
		});
	}
});

// Show a particular team
// server.route({
// 	method: 'GET',
// 	path: '',
// 	handler: function () {

// 	}
// });

server.start((err) => {
	if (err) {
		throw err;
	}

	console.log(`Server running at: ${server.info.uri}`);
})