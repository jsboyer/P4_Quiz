const model = require('./model');

const {log, figlog, errorlog, colorea} = require('./out');

exports.helpCmd = rl => {
	  log('Comandos:');
      log(' h|help - Muestra esta ayuda.');
      log(' list - Listar los quizzes existentes.');
      log(' show <id> - Muestra la pregunta y la respuesta el quiz indicado.');
      log(' add - Añadir un nuevo quiz interactivamente.');
      log(' delete <id> - Borrar el quiz indicado.');
      log(' edit <id> - Editar el quiz indicado.');
      log(' test <id> - Probar el quiz indicado.');
      log(' p|play - Jugar a preguntar aleatoriamente todos los quizzes.');
      log(' credits - Créditos.');
      log(' q|quit - Salir del programa.');
      rl.prompt();
};

exports.listCmd = rl => {
	log('Estas son las preguntas:');
	model.getAll().forEach((quiz, id) => {
		log(` [${colorea(id, 'magenta')}]: ${quiz.question}`);
	});
	rl.prompt();
};

exports.showCmd = (rl, id) => {
	log('Aquí está el quiz que has pedido:');
	if (typeof id === "undefined"){
		errorlog(`Dame el parámetro id`);
	} else {
		try {
			const quiz = model.getByIndex(id);
			log (` [${colorea(id, 'magenta')}]: ${quiz.question} ${colorea('=>', 'magenta')} ${quiz.answer}`);
		} catch(error) {
			errorlog(error.message);
		}
	}
	rl.prompt();
};

exports.addCmd = rl => {
	log('Añade un quiz nuevo:');
	rl.question(colorea(' Dispara la pregunta ', 'red'), question => {
		rl.question(colorea(' Dame la respuesta ', 'red'), answer => {
			model.add(question, answer);
			log(` [${colorea('Se ha añadido', 'magenta')}]: ${question} ${colorea('=>', 'magenta')} ${answer}`);
			rl.prompt();
		});
	});
};

exports.deleteCmd = (rl, id) => {
	if (typeof id === "undefined"){
		errorlog(`Dame el parámetro id`);
	} else {
		try {
			model.deleteByIndex(id);
			log(`El quiz ${id} ha quedado COMPLETAMENTE eliminado`);
		} catch(error) {
			errorlog(error.message);
		}
	}
	rl.prompt();
};

exports.editCmd = (rl, id) => {
	if (typeof id === "undefined"){
		errorlog(`Dame el parámetro id`);
		rl.prompt();
	} else {
		try {
			const quiz = model.getByIndex(id);
			process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
			rl.question(colorea(' Cambia lo que quieras de la pregunta: ', 'red'), question => {
				process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
				rl.question(colorea(' Haz tus retoques en la respuesta: ', 'red'), answer => {
					model.update(id, question, answer);
					log(` Ha ocurrido un girito en el quiz ${colorea(id, 'magenta')} y ahora es: ${question} ${colorea('=>', 'magenta')} ${answer}`);
					rl.prompt();
				});
			});
		} catch(error) {
			errorlog(error.message);
			rl.prompt();
		}
	}	
};

exports.testCmd = (rl, id) => {
	if (typeof id === "undefined"){
		errorlog(`Dame el parámetro id`);
		rl.prompt();
	} else {
		try {
			const quiz = model.getByIndex(id);
			rl.question(` ${quiz.question}:   `, resp => {
					if (resp.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
						log (' ');
						log ('Su respuesta es');
						figlog ('CORRECTA', 'green');
						log ('Efectivamente, la respuesta es correcta.');
						rl.prompt(); 
					} else {
						log (' ');
						log ('Su respuesta es');
						figlog ('INCORRECTA', 'red');
						log ('Efectivamente, la respuesta es incorrecta.');
						rl.prompt(); 	
					}
			});
		} catch(error) {
			errorlog(error.message);
			rl.prompt();
		}
	}	
};

exports.playCmd = rl => {
	log('¡JUEGA!');
 	let score = 0;
 	let toBeResolved = []; // ids de todas las preguntas que existen
 	for (i=0; i<model.count(); i++) {
 		//const ide = model.getByIndex(i);
 		toBeResolved.push(i);
 	};
 	const idGenerator = () => {
 		//let idrandom = Math.round(model.count*Math.random());
 		let idrandom = Math.floor(( Math.random() * model.count()) );
 		return idrandom;
 	};

 	const playOne = () => {
 		log( ' ' );
 		log( `toBeResolved:  ${toBeResolved}`);
 		if (toBeResolved.length === 0) {
 			//mensaje : no queda nada que preguntar
 			log('No queda nada por preguntar');
 			//resultados (lo que hay en la variable score)
 			log(' Has conseguido');
 			figlog(`${score} puntos. `);
 			log('No está mal.');
 			log(' ');
 			figlog('GAME OVER', 'green');
 			log ('Aquí pone Fin');
 			rl.prompt();
 		} else {
 			//let id = azar (metodo math.random() y quitarla del array;
 			//let id = Math.round(model.count*Math.random);
 			//while ( (typeof id === "undefined")|| (toBeResolved.includes(id) === false) ) {
 			//	let id = idGenerator();
 			//};

 			try {
 				do {
 					var id = idGenerator();
 					log( `id generado:  ${id}`);
 				} while ( (typeof id === "undefined") || (toBeResolved.includes(id) === false) );
 				//while ( (typeof id === "undefined") || (toBeResolved.includes(id) === false) ) {
 				//	let id = idGenerator();
 				//};
				const quiz = model.getByIndex(id);
				rl.question(` ${colorea(quiz.question, 'cyanBright')}:   `, resp => {
						if (resp.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
							log (' ');
							log ('Su respuesta es');
							figlog ('CORRECTA', 'green');

							log ('Efectivamente, la respuesta es correcta.');
							//subo score +1
							score += 1;
							var index = toBeResolved.indexOf(id);
							toBeResolved.splice(index, 1);
							// Mensaje : llevas acertadas nosecuantos
							log(` Llevas acertadas ${colorea (score, 'green')} preguntas. Sigue así.`);
							//tengo que volver a preguntar. Un bucle llamada recursiva a playOne() para que vuelva a empezar
							playOne();
						} else {
							log (' ');
							log ('Su respuesta es');
							figlog ('INCORRECTA', 'red');
							log ('Efectivamente, la respuesta es incorrecta.');
							// resultados
							log(` Acertaste ${colorea (score, 'green')} preguntas.`);
							log(' ');
 							figlog('GAME OVER', 'red');
 							log ('Aquí pone Fin');
							//termina el juego
							rl.prompt(); 	
						}
				});
			} catch(error) {
				errorlog(error.message);
				rl.prompt();
			}
		}
	}
	playOne();
};

exports.creditsCmd = rl => {
    log('Mira quién hizo esto:');
    log('Javier Sánchez-Blanco Boyer');
    log('aka jsboyer');
    rl.prompt();
};

exports.quitCmd = rl => {
	rl.close();
};