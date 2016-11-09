var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelize;

// set connection strings and dialect
if(env === 'production'){
	sequelize = new Sequelize(process.env.DATABASE_URL, {
		dialect: 'progres'
	});
} else {
	sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect':'sqlite',
	'storage':__dirname+ '/data/dev-todo-api.sqlite'
});
} 

var db = {};
db.todo = sequelize.import(__dirname + '/models/todo.js');
db.user = sequelize.import(__dirname + '/models/user.js');
db.sequelize = sequelize; 
db.Sequelize = Sequelize; 

db.todo.belongsTo(db.user);
db.user.hasMany(db.todo);

module.exports = db;