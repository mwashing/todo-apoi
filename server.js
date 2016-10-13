var express = require("express");
var bodyParser = require("body-parser");
var _ = require("underscore");
var db = require("./db.js");
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
app.get('/todos', function(req,res){
	// check for query paramaters
	var query = req.query;
	var where = {};
	// check for completed property
	if(query.hasOwnProperty('completed') && query.completed === 'true'){
		where.completed = true; 
	} else if(query.hasOwnProperty('completed') && query.completed === 'false'){
		where.completed = false;
	}
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
app.post('/todos', function(req,res){
	var body = _.pick(req.body,'description','completed');
	db.todo.create(body).then(function(todo){
		res.json(todo.toJSON());
	}).catch(function(e){
		res.status(400).json(e);
	});
});

// get request to get a single todo
app.get('/todos/:id', function(req,res){
	var todoId = parseInt(req.params.id,10);
	db.todo.findById(todoId).then(function(todo){
		if(!!todo){
			res.json(todo.toJSON());
		}
		else{
			res.status(400).send()
		}
	}).catch(function(e){
		res.status(500).send();
	});
});

// delete request to remove single todo
app.delete('/todos/:id',function(req,res){
	var todoId = parseInt(req.params.id);
	if(todoId){
		db.todo.destroy({where: {
			id:todoId
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
app.put('/todos/:id',function(req,res){
	var todoId = parseInt(req.params.id);
	var body = _.pick(req.body,'completed','description');
	var fieldsToUpdate = {};

	// check for completed property
	if(body.hasOwnProperty("completed")){
		fieldsToUpdate.completed = body.completed;
	} 

	// check for description property
	if(body.hasOwnProperty("description")){
		fieldsToUpdate.description = body.description;
	} 

	// execute update query
	db.todo.findById(todoId).then(function(todo){
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
	console.log(body);
	db.user.create(body).then(function(user){
		res.json(user.toJSON());
	}, function(e){
		res.status(400).json(e);
	});
});

db.sequelize.sync().then(function(){
	app.listen(PORT,function(){
		console.log('Express listening on port ' + PORT + "!");
	});
})


