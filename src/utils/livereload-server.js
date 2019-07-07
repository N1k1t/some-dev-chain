const {fork} = require('child_process');
const {parse} = require('url');
const livereload = require('gulp-livereload');
const request = require('request-promise');
const http = require('http');

const {catchError} = require('./');

const [,,threadArg] = process.argv;
const isThread = threadArg == '--is-livereload-thread';
const host = process.env['LIVERELOAD_HOST'] || '127.0.0.100';
const port = process.env['LIVERELOAD_PORT'] || 65100;

if (isThread) createServer(() => process.send('listen'));
checkConnection();

module.exports = {
	useReload: () => makeRequest('reload'),
	useChange: path => makeRequest(`changed?file=${path}`),
	checkConnection
}


async function checkConnection() {
	const [error] = await catchError(makeRequest('test'));
	if (error) return new Promise(res => fork(module.filename, ['--is-livereload-thread']).on('message', res));
}
async function createServer(cb) {
	await new Promise(resolve => livereload.listen({quiet: true}, resolve));
	http.createServer(onRequest).listen(+port, host, cb);
}

function makeRequest(path) {
	return request(`http://${host}:${port}/${path}`)
}
function onRequest(req, res) {
	const {pathname} = parse(req.url);

	switch(pathname) {
		case '/test': return res.end();
		case '/reload': return onReload(req, res);
		case '/changed': return onChange(req, res);
	}

	livereload.changed();
}

function onChange(req, res) {
	const [,path] = parse(req.url).query.split('=');
	
	livereload.changed(path);
	res.end();
}
function onReload(req, res) {
	livereload.reload();
	res.end();
}