const colors = require('colors/safe');

module.exports = {
	throwError
};


function throwError(message) {
	process.stdout.write(colors.red.bold(`${message}\n`));
	process.exit(1);
}