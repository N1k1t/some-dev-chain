module.exports = promiseWrap;


function promiseWrap(fn) {
	return (...args) => new Promise((res, rej) => {
		fn(...args, (error, ...resultArgs) => {
			if (error) rej(error);
			return res(...resultArgs);
		});
	});
}