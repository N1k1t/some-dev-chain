module.exports = main;


async function main(task, config) {
	return await config.handler(task, config);
}