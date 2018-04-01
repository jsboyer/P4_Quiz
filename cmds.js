const {models} = require('./model');

const Sequelize = require('sequelize');

const {log, figlog, errorlog, colorea} = require('./out');

exports.helpCmd = (socket, rl) => {
	  log(socket, 'Comandos:');
      log(socket, ' h|help - Muestra esta ayuda.');
      log(socket, ' list - Listar los quizzes existentes.');
      log(socket, ' show <id> - Muestra la pregunta y la respuesta el quiz indicado.');
      log(socket, ' add - Añadir un nuevo quiz interactivamente.');
      log(socket, ' delete <id> - Borrar el quiz indicado.');
      log(socket, ' edit <id> - Editar el quiz indicado.');
      log(socket, ' test <id> - Probar el quiz indicado.');
      log(socket, ' p|play - Jugar a preguntar aleatoriamente todos los quizzes.');
      log(socket, ' credits - Créditos.');
      log(socket, ' q|quit - Salir del programa.');
      rl.prompt();
};

exports.listCmd = (socket, rl) => {
	log(socket, 'Estas son las preguntas:');
	//model.getAll().forEach((quiz, id) => {
	//	log(` [${colorea(id, 'magenta')}]: ${quiz.question}`);
	//});
	//rl.prompt();

	models.quiz.findAll()
	.each(quiz => {
			log(socket, ` [${colorea(quiz.id, 'magenta')}]: ${quiz.question}`);
	})
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

const validateId = (id) => {
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

const makeQuestion = (rl, text) => {
	return new Sequelize.Promise((resolve, reject) => {
		rl.question(colorea(text, 'red'), answer => {
			resolve(answer.trim());
		});
	});
};

const idGenerator = (max) => {
		let idrandom = (Math.floor( Math.random() * (max-1) ) +1 );
		return idrandom;
	//});
};

exports.showCmd = (socket, rl, id) => {
	log(socket, 'Aquí está el quiz que has pedido:');
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if (!quiz) {
			throw new Error(`No hay quiz asociado al id= ${id}, gañán`);
		}
		log(socket, `[${colorea(quiz.id, 'magenta')}]: ${quiz.question} ${colorea('=>', 'magenta')} ${quiz.answer}`);	
	})
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then(() => {
		rl.prompt();
	});
};


exports.addCmd = (socket, rl) => {
	log(socket, 'Añade un quiz nuevo:');
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
		log(socket, `[${colorea('Se ha añadido', 'magenta')}]: ${quiz.question} ${colorea('=>', 'magenta')} ${quiz.answer}`);
	})
	.catch(Sequelize.ValidationError, error => {
		errorlog(socket, 'El quiz es erronísimamente erróneo');
		error.errors.forEach(({message}) => errorlog(message));
	})
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then(() => {
		rl.prompt();
	});

};

exports.deleteCmd = (socket, rl, id) => {

	validateId(id)
	.then(id => models.quiz.destroy({where: {id}}))
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

exports.editCmd = (socket, rl, id) => {

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
		log(socket, ` Ha ocurrido un girito en el quiz ${colorea(id, 'magenta')} y ahora es: ${quiz.question} ${colorea('=>', 'magenta')} ${quiz.answer}`);	
	})
	.catch(Sequelize.ValidationError, error => {
		errorlog(socket, 'El quiz es erronísimamente erróneo');
		error.errors.forEach(({message}) => errorlog(message));
	})
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

exports.testCmd = (socket, rl, id) => {

	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if (!quiz) {
			throw new Error(`No hay un quiz emparejado al id= ${id}`);
		}
		rl.question(` ${quiz.question}:   `, resp => {
					if (resp.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
						log (socket, ' ');
						log (socket, 'Su respuesta es');
						figlog (socket, 'CORRECTA', 'green');
						log (socket, 'Efectivamente, la respuesta es correcta.');
						rl.prompt(); 
					} else {
						log (socket, ' ');
						log (socket, 'Su respuesta es');
						figlog (socket, 'INCORRECTA', 'red');
						log (socket, 'Efectivamente, la respuesta es incorrecta.');
						rl.prompt(); 	
					}
			});
	})
	.catch(error => {
		errorlog(socket, error.message);
		rl.prompt();
	})


};
	

exports.playCmd = (socket, rl) => {


	let score = 0;
 	let toBeResolved = []; // ids de todas las preguntas que existen

models.quiz.findAll()
        .then(quizzes => {
            toBeResolved = quizzes;
            const playOne = function () {
                if(toBeResolved == 0){
                    //mensaje : no queda nada que preguntar
			 			log(socket, 'No queda nada por preguntar');
			 			//resultados (lo que hay en la variable score)
			 			log(socket, ' Has conseguido');
			 			figlog(socket, `${score} puntos. `);
			 			log(socket, 'No está mal.');
			 			log(socket, ' ');
			 			figlog(socket, 'GAME OVER', 'green');
			 			log (socket, 'Aquí pone Fin');
			 			rl.prompt();
			 			return;
                }
                let id = Math.floor(( Math.random() * toBeResolved.length) );
                let quiz = toBeResolved[id];

                rl.question(` ${colorea(quiz.question, 'cyanBright')}:   `, (answer)=> {
                    if(0==answer.toUpperCase().trim().localeCompare(quiz.answer.toUpperCase().trim())){
                        score++;
                        log (socket, ' ');
						log (socket, 'Su respuesta es');
						figlog (socket, 'CORRECTA', 'green');
						log (socket, 'Efectivamente, la respuesta es correcta.');
                        toBeResolved.splice(id,1);
                        log(socket, ` Llevas acertadas ${colorea (score, 'green')} preguntas. Sigue así.`);
                        playOne();
                    }else{
                        log (socket, ' ');
						log (socket, 'Su respuesta es');
						figlog (socket, 'INCORRECTA', 'red');
						log (socket, 'Efectivamente, la respuesta es incorrecta.');
						// resultados
						log(socket, ` Acertaste ${colorea (score, 'green')} preguntas.`);
						log(socket, ' ');
			 			figlog(socket, 'GAME OVER', 'red');
			 			log (socket, 'Aquí pone Fin');
						//termina el juego
						rl.prompt();
                    }
                });
            };
            playOne();
        })
        .catch(error => {
           errorlog(socket, error);
            rl.prompt();
        });

};

exports.creditsCmd = (socket, rl) => {
    log(socket, 'Mira quién hizo esto:');
    log(socket, 'Javier Sánchez-Blanco Boyer');
    log(socket, 'aka jsboyer');
    rl.prompt();
};

exports.quitCmd = (socket, rl) => {
	rl.close();
	socket.end();
};