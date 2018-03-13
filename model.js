const Sequelize = require('sequelize');

const sequelize = new Sequelize("sqlite:quizzes.sqlite", {logging: false});

sequelize.define('quiz', {
	question: {
		type: Sequelize.STRING,
		unique: {msg: "Esa pregunta ya existe"},
		validate: {notEmpty: {msg: "La pregunta no puede estar vacía como tu corazón"}}
	},
	answer: {
		type: Sequelize.STRING,
		validate: {notEmpty: {msg: "La respuesta no puede estar vacía como tu corazón"}}
	}
});

sequelize.sync()
.then(() => sequelize.models.quiz.count())
.then(count => {
	if (!count) {
		return sequelize.models.quiz.bulkCreate([
			{question: "2+2", answer: "4"},
			{question: "1+1", answer: "2"},
			{question: "2*2", answer: "4"},
			{question: "2000+18", answer: "2018"}
		]);
	}
})
.catch(error => {
	console.log(error);
});

module.exports = sequelize;