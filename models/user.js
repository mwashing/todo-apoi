var bcrypt = require('bcryptjs');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, dataTypes){
	var user = sequelize.define('user',{
		email: {
			type: dataTypes.STRING, 
			allowNull: false, 
			unique: true,
			validate: {
				isEmail:true
			}
		}, 
		salt: {
			type: dataTypes.STRING
		},
		password_hash: {
			type: dataTypes.STRING
		},
		password: {
			type: dataTypes.VIRTUAL, 
			allowNull: false, 
			validate: {
				len: [7,100]
			},
			set: function(value){
				var salt = bcrypt.genSaltSync(10);
				var hashedPassword = bcrypt.hashSync(value,salt);

				this.setDataValue('password',value);
				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hashedPassword);
			}

		}
	},
	{
		hooks:{
			beforeValidate: function(user, options){
				var email = user.email;
				if(email && typeof email === 'string'){
					user.email = user.email.toLowerCase();
				}
			}
		},

		classMethods: {
			authenticate: function(body){
				return new Promise(function(resolve,reject){
					if(!_.isString(body.email) || !_.isString(body.password)){
						return reject();
					}
					user.findOne({
						where:{email:body.email}
					}).then(function(user){
						if(!user || !bcrypt.compareSync(body.password,user.get('password_hash'))) {
							return reject();
						} 
						resolve(user);
					},function(e){
						reject();
					});
				});
			}
		},

		instanceMethods:{
			toPublicJSON: function(){
				var json = this.toJSON();
				return _.pick(json,'id','email','createdAt','updatedAt');
			},
			generateToken: function(type){
				if(!_.isString(type)){
					return undefined;
				}

				try{
					var stringData = JSON.stringify({id: this.get('id'), type:type});
					var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123').toString();
					var token = jwt.sign({
						token:encryptedData,
					},'qwerty098');
					return token;
				}catch (e){
					console.error(e);	
					return undefined;
				}
			}
		}
	});

	return user; 
};