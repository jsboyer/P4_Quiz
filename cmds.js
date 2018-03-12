const {models} = require('./model');

const Sequelize = require('sequelize');

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
	//model.getAll().forEach((quiz, id) => {
	//	log(` [${colorea(id, 'magenta')}]: ${quiz.question}`);
	//});
	//rl.prompt();

	models.quiz.findAll()
	.each(quiz => {
			log(` [${colorea(quiz.id, 'magenta')}]: ${quiz.question}`);
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

const validateId = id => {
	return new Sequelize.Promise((resolve, reject) => {
		if (typeof id === "undefined"){
			reject(new Error(`Dame el parámetro <id>`));
		} else {
			id = parseInt(id);
			if (Number.isNaN(id)) {
				reject(new Error(`El valor del parámetro <id> no es un número`))
			} else {
				resolve(id);
			}
		}
	});
};

exports.showCmd = (rl, id) => {
	log('Aquí está el quiz que has pedido:');
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if (!quiz) {
			throw new Error(`No hay quiz asociado al id= ${id}, gañán`);
		}
		log(`[${colorea(quiz.id, 'magenta')}]: ${quiz.question} ${colorea('=>', 'magenta')} ${quiz.answer}`);	
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

const makeQuestion = (rl, text) => {
	return new Sequelize.Promise((resolve, reject) => {
		rl.question(colorea(text, 'red'), answer => {
			resolve(answer.trim());
		});
	});
};

exports.addCmd = rl => {
	log('Añade un quiz nuevo:');
	//rl.question(colorea(' Dispara la pregunta ', 'red'), question => {
	//	rl.question(colorea(' Dame la respuesta ', 'red'), answer => {
	//		model.add(question, answer);
	//		log(` [${colorea('Se ha añadido', 'magenta')}]: ${question} ${colorea('=>', 'magenta')} ${answer}`);
	//		rl.prompt();
	//	});
	//});
	makeQuestion(rl, ' Dispara la pregunta: ')
	.then(q => {
		return makeQuestion(rl, ' Dame la respuesta: ')
		.then(a => {
			return {question: q, answer: a};
		});
	})
	.then(quiz => {
		return models.quiz.create(quiz);
	})
	.then(quiz => {
		log(`[${colorea('Se ha añadido', 'magenta')}]: ${quiz.question} ${colorea('=>', 'magenta')} ${quiz.answer}`);
	})
	.catch(Sequelize.ValidationError, error => {
		errorlog('El quiz es erronísimamente erróneo');
		error.errors.forEach(({message}) => errorlog(message));
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});

};

exports.deleteCmd = (rl, id) => {
	/*if (typeof id === "undefined"){
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
	*/
	validateId(id)
	.then(id => models.quiz.destroy({where: {id}}))
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

exports.editCmd = (rl, id) => {
/*	if (typeof id === "undefined"){
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
*/
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if (!quiz) {
			throw new Error(`No hay un quiz emparejado al id= ${id}`);
		}
		process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
		return makeQuestion(rl, ' Cambia lo que quieras de la pregunta: ')
		.then(q => {
			process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);
			return makeQuestion(rl, ' Haz tus retoques en la respuesta: ')
			.then(a => {
				quiz.question = q;
				quiz.answer = a;
				return quiz;
			});
		});
	})
	.then(quiz => {
		return quiz.save();
	})
	.then(quiz => {
		log(` Ha ocurrido un girito en el quiz ${colorea(id, 'magenta')} y ahora es: ${quiz.question} ${colorea('=>', 'magenta')} ${quiz.answer}`);	
	})
	.catch(Sequelize.ValidationError, error => {
		errorlog('El quiz es erronísimamente erróneo');
		error.errors.forEach(({message}) => errorlog(message));
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

exports.testCmd = (rl, id) => {
/*	if (typeof id === "undefined"){
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
*/
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if (!quiz) {
			throw new Error(`No hay un quiz emparejado al id= ${id}`);
		}
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
	})
	.catch(error => {
		errorlog(error.message);
		rl.prompt();
	})


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

exports.playCmd = rl => {

// cargar inicialmente en un array todas las preguntas que hay 
//y según las voy preguntando aleatoriamente, eliminiarlas del array

/*	log('¡JUEGA!');
 	let score = 0;
 	let toBeResolved = []; // ids de todas las preguntas que existen
 	for (i=0; i<sequelize.models.quiz.count(); i++) {
 		//const ide = model.getByIndex(i);
 		toBeResolved.push(i);
 	};
 	const idGenerator = () => {
 		//let idrandom = Math.round(model.count*Math.random());
 		let idrandom = Math.floor(( Math.random() * sequelize.models.quiz.count()) );
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
*/
	/*Sequelize.count()
	.then( quiz => {
		for (i=0; i<Sequelize.count(); i++) {
 		//const ide = model.getByIndex(i);
 		toBeResolved.push(i);
 	};
 	const idGenerator = () => {
 		//let idrandom = Math.round(model.count*Math.random());
 		let idrandom = Math.floor(( Math.random() * Sequelize.count()) );
 		return idrandom;
 	};

	})
	.then(quiz => {
		playOne();
	})
	.catch(error => {
		errorlog(error.message);
		rl.prompt();
	}) */

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