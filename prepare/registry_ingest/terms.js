var clc = require('cli-color')

module.exports = function(db){


	return function(callback){


		//remove the any old stuff
		db.databaseConnectRegistryIngest(function(){

			//remove the any old stuff
			var collection = db.databaseRegistryIngest.collection('terms')
			console.log("Dropping Table")
			//delete any existing data first
			collection.drop(function(err,results){
				console.log("terms Table dropped")
				if (err){
					if (err.message != 'ns not found'){
						console.log(clc.redBright('prepare terms - drop collection'), clc.greenBright(err), console.dir(err))
					}
				}

				var collection = db.databaseRegistryIngest.collection('terms')

				console.log("Creating Indexes")
				collection.createIndex("fast", {background: true, unique: true})
				collection.createIndex("fastAll", {background: true, unique: true})
				collection.createIndex("registry", {background: true, unique: true})
				collection.createIndex("termControlled", {background: true, unique: true})
				collection.createIndex("termNormalized", {background: true})



				if (callback) callback()
			})

		})

	}
}

