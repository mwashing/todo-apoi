var express = require("express");
var bodyParser = require("body-parser");
var _ = require("underscore");
var db = require("./db.js");
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1; 

// helper functions
function findTodo(todoId){
	var matchedTodo; 
	todos.forEach(function(todo){
		if(todo.id === todoId){
			matchedTodo = todo;
		}
	});
	return matchedTodo;
}
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
	console.log("checking for completed status");
	if(query.hasOwnProperty('completed') && query.completed === 'true'){
		where.completed = true; 
		console.log("setting item to true");
	} else if(query.hasOwnProperty('completed') && query.completed === 'false'){
		where.completed = false;
		console.log("setting item to false");
	}

	if(query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = { $like: '%'+query.q+'%'};
	}

	db.todo.findAll({
		where: where
	}).then(function(todos){
		res.json(todos);
	}).catch(function(e){
		res.status(500).send(e);
	});
	// var filteredTodos = todos;

	// if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true'){
	// 	filteredTodos  = _.where(filteredTodos,{completed:true});
	// } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false'){
	// 	filteredTodos  = _.where(filteredTodos,{completed:false});
	// }

	// if(queryParams.hasOwnProperty('q') && queryParams.q.trim().length > 0){
	// 	console.log("looking for q property: " + queryParams.q);
	// 	filteredTodos = _.filter(filteredTodos, function(todo){
	// 		return todo.description.toLowerCase().includes(queryParams.q.toLowerCase());
	// 	});
	// }

	//return res.json(filteredTodos);
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
	var matchedTodo = _.findWhere(todos,{id:todoId});
	if(matchedTodo){
		todos = _.without(todos,matchedTodo);
		return res.json(matchedTodo);
	}else{
		return res.status(404).send("Item not found to remove");
	}
});

//put request to update todo 
app.put('/todos/:id',function(req,res){
	var todoId = parseInt(req.params.id);
	var matchedTodo = _.findWhere(todos,{id:todoId});
	var body = _.pick(req.body,'completed','description');
	var validAttributes = {};

	if(!matchedTodo){
		return res.status(404).send();
	}
	// check for valid completed attribute
	if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
		validAttributes.completed  = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).send();
	}
	// check for valid description attribute
	if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')){
		return res.status(400).send();
	}

	// update current item
	_.extend(matchedTodo,validAttributes);
	return res.json(matchedTodo);

});

db.sequelize.sync().then(function(){
	app.listen(PORT,function(){
		console.log('Express listening on port ' + PORT + "!");
	});
})


