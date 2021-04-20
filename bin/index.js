#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {help, serve} = require('./routes');
const {throwError} = require('./stdout-utils');

const [,,command, configPath] = process.argv;
const rootPath = process.cwd();
const instance = {rootPath, command, configPath};

route(instance, command);

function route(instance, command) {
	switch(command) {
		case '-h':
		case '--help': return help();

		case 'serve': return serve(instance);

		default: return throwError('Command not found');
	}
}