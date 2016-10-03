var express = require("express");
var bodyParser = require("body-parser");
var _ = require("underscore");
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

// get request to show all todos
app.get('/todos', function(req,res){
	return res.json(todos);
});

// post request to create a new todo
app.post('/todos', function(req,res){
	var body = _.pick(req.body,'description','completed');
	
	if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
		return res.status(400).send("Invalid Parameters");
	}

	body.description = body.description.trim();
	body.id = todoNextId++;
	todos.push(body);
	return res.json(body);
});

// get request to get a single todo
app.get('/todos/:id', function(req,res){
	var todoId = parseInt(req.params.id,10);
	var matchedtodo = _.findWhere(todos,{id:todoId});
	if(matchedtodo){
		return res.json(matchedtodo)
	}else{
		return res.status(404).send("Could not find the requested item");
	}
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

// open the port to listen on
app.listen(PORT,function(){
	console.log('Express listening on port ' + PORT + "!");
});

