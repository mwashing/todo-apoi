module.exports = function(sequelize, dataTypes){
	return sequelize.define('user',{
		email: {
			type: dataTypes.STRING, 
			allowNull: false, 
			unique: true,
			validate: {
				isEmail:true
			}
		}, 
		password: {
			type: dataTypes.STRING, 
			allowNull: false, 
			validate: {
				len: [7,100]
			}

		}
	},
	{
		hooks:{
			beforeValidate: function(user, options){
				console.log("in validate method for email");
				var email = user.email;
				if(email && typeof email === 'string'){
					user.email = user.email.toLowerCase();
					console.log("done validation email is: " + email);
				}
			}
		}
	}
	);
}