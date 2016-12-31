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

// Register vision for our views
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
server.route({
	method: 'GET',
	path: '/teams/{id}',
	handler: function (request, reply) {
		let teamID = encodeURIComponent(request.params.id);
		var fixtures;

		Request.get('http://api.football-data.org/v1/teams/' + teamID, function (error, response, body) {
			if (error) {
				throw error;
			}

			Request.get('http://api.football-data.org/v1/teams/' + teamID + '/fixtures', function (error, response, body) {
				if (error) {
					throw error;
				}

				fixtures = JSON.parse(body);

				// if (data.status === "SCHEDULED") {
					
				// 	console.log(data);
				// }
			});

			var result = JSON.parse(body);

			// reply.view('team', { result: result, fixtures: fixtures });
			console.log(fixtures);
		});
	}
});

// A simple helper function that extracts team ID from team URL
Handlebars.registerHelper('teamID', function (teamUrl) {
	return teamUrl.slice(38);
});

server.start((err) => {
	if (err) {
		throw err;
	}

	console.log(`Server running at: ${server.info.uri}`);
});