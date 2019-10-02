const Path = require('path');

module.exports = {getPluginPath, getPresetPath};


function getPluginPath(name) {
	if (name[0] == '@') return Path.resolve(`${__dirname}/../../node_modules/@babel/plugin-${name.substr(1)}`);
	return Path.resolve(`${__dirname}/../../node_modules/babel-plugin-${name}`);
}
function getPresetPath(name) {
	if (name[0] == '@') return Path.resolve(`${__dirname}/../../node_modules/@babel/preset-${name.substr(1)}`);
	return Path.resolve(`${__dirname}/../../node_modules/babel-preset-${name}`);
}