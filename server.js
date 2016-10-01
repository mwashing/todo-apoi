var express = require("express");
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
	id: 1,
	description: 'Meet mom for lunch',
	completed: false
},{
	id: 2,
	description: 'Go to market',
	completed:false
},{
	id:3,
	description: 'take dogs for a walk',
	completed:false
}];

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

//create a get 
app.get('/',function(req,res){
	res.send('Todo API root');
});

// get request to show all todos
app.get('/todos', function(req,res){
	res.json(todos);
});

// post request to create a new todo
app.post('/todos/:id/:description/:completed', function(req,res){
	var id = parseInt(req.params.id,10);
	var description = req.params.description;
	var completed = req.params.completed;
	var matchedTodo; 
	// check for undefined values
	if(id && description && completed){
		matchedTodo = findTodo(id);
		if(matchedTodo){
			res.status(404).send("Item ID already exists");
		}else{
			todos.push({
				id:id,
				description:description,
				completed:completed
			});
		res.status(200).send('item sucessfully added to the todo list');
		}

	}
	else{
		res.status(400).send("Invalid paramaters");
	}	
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

