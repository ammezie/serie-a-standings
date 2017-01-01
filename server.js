'use strict'

const Hapi = require('hapi');
const Request = require('request');
const Vision = require('vision');
const Handlebars = require('handlebars');
const LodashFilter = require('lodash.filter');
const LodashTake = require('lodash.take');

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

// Custom headers
const options = {
	headers: {
		'X-Auth-Token': 'b4cef398d42f42738085250cebab40da'
	}
}

// Show teams standings
server.route({
	method: 'GET',
	path: '/',
	handler: function (request, reply) {
		Request.get('http://api.football-data.org/v1/competitions/438/leagueTable', options, function (error, response, body) {
			if (error) {
				throw error;
			}

			const data = JSON.parse(body);
			reply.view('index', { result: data });
		});
	}
});

// Show a particular team
server.route({
	method: 'GET',
	path: '/teams/{id}',
	handler: function (request, reply) {
		const teamID = encodeURIComponent(request.params.id);

		Request.get('http://api.football-data.org/v1/teams/' + teamID, options, function (error, response, body) {
			if (error) {
				throw error;
			}

			const result = JSON.parse(body);

			Request.get('http://api.football-data.org/v1/teams/' + teamID + '/fixtures', options, function (error, response, body) {
				if (error) {
					throw error;
				}

				const fixtures = LodashTake(LodashFilter(JSON.parse(body).fixtures, function (match) {
					return match.status === 'SCHEDULED';
				}), 5);

				reply.view('team', { result: result, fixtures: fixtures });
			});
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