const figlet = require('figlet');
const chalk = require('chalk');

const colorea = (msg, color) => {

	if (typeof color !== "undefined") {
		msg = chalk[color].bold(msg);
	}
	return msg;

};

const log = (socket, msg, color) => {
	socket.write(colorea(msg, color) + "\n");
};

const figlog = (socket, msg, color) => {
	log(socket, figlet.textSync(msg, {horizontalLayout: 'full'}), color);
};

const errorlog = (socket, emsg) => {
	socket.write(`${colorea("ERROR", 'red')}: ${colorea(colorea(emsg, 'red'), "bgYellowBright")}\n`);
};

exports = module.exports = {
	colorea,
	log,
	figlog,
	errorlog
}