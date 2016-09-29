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

//create a get 
app.get('/',function(req,res){
	res.send('Todo API root');
});

// get request to show all todos
app.get('/todos', function(req,res){
	res.json(todos);
});

app.get('/todos/:id', function(req,res){
	var todoId = parseInt(req.params.id,10);
	var todo; 
	for(var i = 0; i < todos.length; i++){
		console.log("looking at item " + todos[i].id + 'against todo item ' + todoId);
		if(todoId === todos[i].id){
			console.log("Item found " + todoId);
			todo = todos[i];
		}
	};
	if(todo){
		res.json(todo)
	}else{
		console.log("could not find requested todo item");
		res.status(404).send();
	}
});

// open the port to listen on
app.listen(PORT,function(){
	console.log('Express listening on port ' + PORT + "!");
});

