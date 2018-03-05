const figlet = require('figlet');
const chalk = require('chalk');

const colorea = (msg, color) => {

	if (typeof color !== "undefined") {
		msg = chalk[color].bold(msg);
	}
	return msg;

};

const log = (msg, color) => {
	console.log(colorea(msg, color));
};

const figlog = (msg, color) => {
	log(figlet.textSync(msg, {horizontalLayout: 'full'}), color);
};

const errorlog = (emsg) => {
	console.log(`${colorea("ERROR", 'red')}: ${colorea(colorea(emsg, 'red'), "bgYellowBright")}`);
};

exports = module.exports = {
	colorea,
	log,
	figlog,
	errorlog
}