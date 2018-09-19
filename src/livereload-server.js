const livereload = require('gulp-livereload');
const http = require('http');
const Async = require('some-async-chain');
const childProcess = require('child_process');

let isListened = false;
let host = process.argv[3] || '127.100.100.100';
let port = process.argv[4] || '1000';

if ( process.argv[2] == '--is-livereload-thread' ) return createServer(() => {
	if ( process.send ) process.send('listen');
});

module.exports = {
	reload: () => makeRequest('reload'),
	changed: (path) => makeRequest(`changed?file=${path}`),
	
	async checkListen(cb = Function(null)){
		if ( isListened ) return cb();

		await checkConnection();

		isListened = true;
		cb();
	}
}

function checkConnection(){
	return Async.createPromise((resolve) => {
		makeRequest(
			'test', 
			(res) => resolve(), 
			(err) => childProcess.fork(module.filename, ['--is-livereload-thread']).on('message', () => resolve())
		);
	});
}
function makeRequest(path, onSuccess = Function(null), onError = Function(null)){
	return http.get(`http://${host}:${port}/${path}`, (res) => onSuccess(res)).on('error', (err) => onError(err));
}

async function createServer(cb){
	await Async.createPromise((resolve) => livereload.listen({ quiet: true }, () => resolve()));

	http.createServer(onRequest).listen(1000, '127.100.100.100', cb);
}
function onRequest(req, res){
	const { parse } = require('url');
	let urlParts = parse(req.url);

	switch(urlParts.pathname) {
		case '/test': return res.end();
		case '/reload': return livereload.reload();
		case '/changed': return onChange();
	}

	function onChange(){
		let [field, value] = urlParts.query.split('=');

		livereload.changed(value);
	}
	livereload.changed()
}