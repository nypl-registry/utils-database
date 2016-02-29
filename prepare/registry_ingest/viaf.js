var clc = require('cli-color')

module.exports = function(db){


	return function(callback){

		db.databaseConnectRegistryIngest(function(){
			//remove the any old stuff
			var collection = db.databaseRegistryIngest.collection('viaf')
			console.log("Dropping Table")
			//delete any existing data first
			collection.drop(function(err,results){
				console.log("viaf Table dropped")
				if (err){
					if (err.message != 'ns not found'){
						console.log(clc.redBright('prepare viaf - drop collection'), clc.greenBright(err), console.dir(err))
					}
				}

				var collection = db.databaseRegistryIngest.collection('viaf')

				console.log("Creating Indexes")
				//now prepare the indexes
				collection.createIndex("normalized", {background: true})
				collection.createIndex("fast", {background: true})
				collection.createIndex("viaf", {background: true})
				collection.createIndex("hasLc", {background: true})
				collection.createIndex("hasDbn", {background: true})
				collection.createIndex("lcId", {background: true})
				collection.createIndex("gettyId", {background: true})
				if (callback) callback()
			})
		})
	}
}

