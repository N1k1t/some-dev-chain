const readline = require('readline');
const EventEmitter = require('events');

const colors = require('colors/safe');
const {getEnvValue} = require('../utils');
const {isPlainObject} = require('lodash');

class Commander extends EventEmitter {
	constructor(params = {}) {
		super();

		Object.assign(this, {
			_commands: new Map()
		});

		this.registerCommand('--help', {description: 'For help'}, this.printHelp);
	}

	get commands() {
		return this._commands;
	}

	get messages() {
		return {
			notAvailable: colors.red.bold('This command is not available. Try --help')
		}
	}

	init() {
		readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			terminal: false
		}).on('line', line => {
			const [command, ...input] = line.split(' ');
			const {notAvailable} = this.messages;

			if (!this.commands.has(command)) return this._printMessage(notAvailable)
			this.emit(command, ...input);
		});
	}

	registerCommand(command, inputOptions, inputCallback) {
		const callback = inputCallback ? inputCallback : inputOptions;
		const options = isPlainObject(inputOptions) ? inputOptions : {};

		if (options.params && !options.params.length) delete options.params;

		this.commands.set(command, options);
		this.on(command, callback);
	}

	printHelp() {
		const separator = Array(80).fill(colors.gray('-')).join('');
		const message = [colors.white.bold('\n  Use:'), separator];

		this.commands.forEach(({params = [' '], description = ''}, name) => {
			message.push(`  ${colors.green.bold(name)}  ${colors.magenta.bold(params.join(' '))}`.padEnd(90, ' ') + description);
			message.push(separator);
		});

		return this._printMessage(message.join('\n') + '\n');
	}

	_printMessage(message) {
		return process.stdout.write(`${message}\n`);
	}

	static build(params) {
		return new Commander(params);
	}
}

module.exports = Commander;