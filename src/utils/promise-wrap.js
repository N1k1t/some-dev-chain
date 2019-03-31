module.exports = promiseWrap;

function promiseWrap(method) {
	return (...args) => new Promise((res, rej) => {
		method(...args, (error, ...resultArgs) => {
			if (error) {
				return rej(error);
			}

			return res(...resultArgs);
		});
	});
}