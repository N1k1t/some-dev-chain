const colors = require('colors/safe');
const {version} = require('../../package');

module.exports = main;


function main() {
	const message = colors.green.bold(`
		*
		*
		* [Version: ${version}]
		*
		* [If dev-chain was installed GLOBALY]
		* - dev-chain start :path-to-config  ---------------------------------  | Use for start dev-chain server
		*
		* [If dev-chain was installed LOCALY]
		* - node_modules/.bin/dev-chain start :path-to-config  ---------------  | Use for start dev-chain server
		*
		*`).replace(/\t|^\n/g, '');

	process.stdout.write(message);
	process.exit(0);
}