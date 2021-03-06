var express = require("express");
var bodyParser = require("body-parser");
var bcrypt = require("bcryptjs");
var _ = require("underscore");
var db = require("./db.js");
var middleware = require("./middleware.js")(db);
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1; 

// helper functions

// add in any middleware
app.use(bodyParser.json());
//create a get 
app.get('/',function(req,res){
	return res.send('Todo API root');
});

// /todos?completed=true&q=work
app.get('/todos', middleware.requireAuthentication, function(req,res){
	// check for query paramaters
	var query = req.query;
	var where = {};
	// check for completed property
	if(query.hasOwnProperty('completed') && query.completed === 'true'){
		where.completed = true; 
	} else if(query.hasOwnProperty('completed') && query.completed === 'false'){
		where.completed = false;
	}

	// check for user association
	where.userId = req.user.get('id');
	console.log("where id: " + where.userId);
	// check for q property 
	if(query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = { $like: '%'+query.q+'%'};
	}
	// execute the database query
	db.todo.findAll({
		where: where
	}).then(function(todos){
		res.json(todos);
	}).catch(function(e){
		res.status(500).send(e);
	}); 
});

// post request to create a new todo
app.post('/todos', middleware.requireAuthentication, function(req,res){
	var body = _.pick(req.body,'description','completed');
	db.todo.create(body).then(function(todo){
		req.user.addTodo(todo).then(function(){
			//reloading to force the association
			return todo.reload();
		}).then(function (todo){
			res.json(todo.toJSON());
		});
	},function(e){
		res.status(400).json(e);
	});
});

// get request to get a single todo
app.get('/todos/:id', middleware.requireAuthentication, function(req,res){
	// create the where object with the query
	var todoId = parseInt(req.params.id,10);
	var where = {
		id: todoId,
		userId: req.user.get('id')
	};
	db.todo.findOne({
		where: where
	}).then(function(todo){
		if(!!todo){
			res.json(todo);
		}
		else{
			res.status(400).send()
		}
	}).catch(function(e){
		console.log(e);
		res.status(500).send();
	});
});

// delete request to remove single todo
app.delete('/todos/:id', middleware.requireAuthentication, function(req,res){
	var todoId = parseInt(req.params.id);
	var userId = req.user.get('id');
	if(todoId){
		db.todo.destroy({where: {
			id:todoId,
			userId:userId
		} 
	}).then(function(rowsDeleted){
			if(rowsDeleted === 0){
				res.status(404).json({
					error: 'No todo with id'
				});
			} else {
				res.status(204).send();
			}
		}, function(){
			res.status(500).send();
		});
	}
});

//put request to update todo 
app.put('/todos/:id', middleware.requireAuthentication, function(req,res){
	var todoId = parseInt(req.params.id);
	var body = _.pick(req.body,'completed','description');
	var fieldsToUpdate = {};
	var where = {
		id:todoId,
		userId: req.user.get('id')
	}

	// check for completed property
	if(body.hasOwnProperty("completed")){
		fieldsToUpdate.completed = body.completed;
	} 

	// check for description property
	if(body.hasOwnProperty("description")){
		fieldsToUpdate.description = body.description;
	} 

	// execute update query
	db.todo.findOne({
		where: where
	}).then(function(todo){
		if(todo){
			todo.update(fieldsToUpdate).then(function(todo){
				res.json(todo.toJSON());
			}, function(e){
				res.status(400).json(e);
			});
		}else{
			res.status(404).send();
		}
	}, function(){
		res.status(500).send();
	});

});

app.post('/users', function(req,res){
	var body = _.pick(req.body,'email','password');
	db.user.create(body).then(function(user){
		res.json(user.toPublicJSON());
	}, function(e){
		res.status(400).json(e);
	});
});

//POST /users/login
app.post('/users/login', function(req,res){
	var body = _.pick(req.body,'email','password');
	db.user.authenticate(body).then(function(user){
		var token = user.generateToken('authentication');
		if(token){
			res.header('Auth',token).json(user.toPublicJSON());
		} else {
			res.status(401).send();
		}
	}, function(){
		res.status(401).send();
	});
})

db.sequelize.sync({force:true}).then(function(){
	app.listen(PORT,function(){
		console.log('Express listening on port ' + PORT + "!");
	});
})


