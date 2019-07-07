const colors = require('colors/safe');
const {getEnvValue} = require('../utils');

class Logger {
	constructor(params = {}) {
		const {title} = params;
		this.setTitle(title);
	}

	get title() {
		return this._title;
	}

	setTitle(title = 'Logger') {
		this._title = title;
	}

	custom(title, inputMessage, borderColor = 'magenta', headerBgColor = 'bgMagenta') {
		if (getEnvValue('NO_LOGGER_CUSTOM')) return false;

		const message = this._buildMessage(`(${title})`, inputMessage, borderColor, headerBgColor);
		return this._sendMessage(message);
	}
	info(inputMessage, borderColor = 'magenta', headerBgColor = 'bgMagenta') {
		if (getEnvValue('NO_LOGGER_INFO')) return false;

		const message = this._buildMessage(`[${this.title}]`, inputMessage, borderColor, headerBgColor);
		return this._sendMessage(message);
	}

	success(inputMessage, borderColor = 'green', headerBgColor = 'bgGreen') {
		if (getEnvValue('NO_LOGGER_SUCCESS')) return false;

		const message = this._buildMessage(`<${this.title}>`, inputMessage, borderColor, headerBgColor);
		return this._sendMessage(message);
	}
	error(inputMessage, borderColor = 'red', headerBgColor = 'bgRed') {
		if (getEnvValue('NO_LOGGER_ERROR')) return false;

		const message = this._buildMessage(`<${this.title}>`, colors.red.bold(inputMessage), borderColor, headerBgColor);
		return this._sendMessage(message);
	}

	_buildMessage(header, inputMessage, borderColor = 'green', headerBgColor = 'bgCyan') {
		let result = '';

		result += `${colors.bold[borderColor]('|')}  `
		result += `${colors.gray(new Date().toLocaleTimeString())}  `
		result += `${colors[headerBgColor].white.bold(` ${header} `)}`.padEnd(45, ' ');
		result += `${colors.gray('>')} ${colors.bold(inputMessage)}`;

		return result;
	}
	_sendMessage(message) {
		if (getEnvValue('NO_LOGGER')) return false;
		return process.stdout.write(`${message}\n`);
	}

	static build(params) {
		return new Logger(params);
	}
	static setLevels(levels) {
		if (levels.indexOf('error') == -1) process.env['NO_LOGGER_ERROR'] = true;
		if (levels.indexOf('info') == -1) process.env['NO_LOGGER_INFO'] = true;
		if (levels.indexOf('warn') == -1) process.env['NO_LOGGER_WARN'] = true;
		if (levels.indexOf('success') == -1) process.env['NO_LOGGER_SUCCESS'] = true;
		if (levels.indexOf('custom') == -1) process.env['NO_LOGGER_CUSTOM'] = true;

		if (!levels.length) process.env['NO_LOGGER'] = true;
	}
}

module.exports = Logger;