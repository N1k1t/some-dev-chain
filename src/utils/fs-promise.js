const fs = require('fs');
const promiseWrap = require('./promise-wrap');

module.exports = {
	mkdir: promiseWrap(fs.mkdir),
	stat: promiseWrap(fs.stat),
	readdir: promiseWrap(fs.readdir),
	readFile: promiseWrap(fs.readFile),
	writeFile: promiseWrap(fs.writeFile)
}