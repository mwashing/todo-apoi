var express = require("express");
var app = express();
var PORT = process.env.PORT || 3000;
//create a get 
app.get('/',function(req,res){
	res.send('Todo API root');
});

// open the port to listen on
app.listen(PORT,function(){
	console.log('Express listening on port ' + PORT + "!");
});

