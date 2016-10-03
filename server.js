var express = require("express");
var bodyParser = require("body-parser");
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
	res.send('Todo API root');
});

// get request to show all todos
app.get('/todos', function(req,res){
	res.json(todos);
});

// post request to create a new todo
app.post('/todos', function(req,res){
	var body = req.body;
	body.id = todoNextId++;
	todos.push(body);
	console.log('Description ' + body.description + "id: " + body.id);
	res.json(body);
});

// get request to get a single todo
app.get('/todos/:id', function(req,res){
	var todoId = parseInt(req.params.id,10);
	var matchedtodo; 
	matchedtodo = findTodo(todoId);
	console.log(matchedtodo);
	if(matchedtodo){
		res.json(matchedtodo)
	}else{
		res.status(404).send("Could not find the requested item");
	}
});

// delete request to remove single todo
app.delete('/todos/:id',function(req,res){
	var matchedTodo = findTodo(parseInt(req.params.id));
	if(matchedTodo){
		for(var i = 0; i < todos.length; i++){
			if(todos[i].id == matchedTodo.id){
				todos.splice(i,1);
				res.status(200).send('Item sucessfull removed');
			}
		}	
	}else{
		res.status(404).send("Item not found to remove");
	}
});

//put request to update todo 
app.put('/todos/:id/:description/:completed',function(req,res){
	var id = req.params.id;
	var description = req.params.description;
	var completed = req.params.completed;
// verifiy that the input is legal
	var newTodo = {
		id: id,
		description: description,
		completed: completed
	};
	var matchedTodo = findTodo(parseInt(id));
	if(matchedTodo){
		for(var i = 0; i < todos.length; i++){
			if(todos[i].id === matchedTodo.id){
				todos.splice(i,1,newTodo);
				res.status(200).send("Item successfully updated");
			}
		};
	}else{
		res.status(404).send("Item not found to update");
	}
});

// open the port to listen on
app.listen(PORT,function(){
	console.log('Express listening on port ' + PORT + "!");
});

