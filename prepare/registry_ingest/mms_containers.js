var clc = require('cli-color')

module.exports = function(db){


	return function(callback){

		//remove the any old stuff
		db.databaseConnectRegistryIngest(function(){

			var collection = db.databaseRegistryIngest.collection('mmsContainers')

			//delete any existing data first
			collection.drop(function(err,results){
				if (err){
					if (err.message != 'ns not found'){
						console.log(clc.redBright('prepareIngestMmsCollections - drop collection'), clc.greenBright(err), console.dir(err))
					}
				}


				//now prepare the indexes
				collection.createIndex("mmsDb", {background: true})
				collection.createIndex("bNumber", {background: true})
				collection.createIndex("callNumber", {background: true})
				collection.createIndex({"title": "text"}, {background: true})
				collection.createIndex("collectionUuid", {background: true})
				collection.createIndex("parents", {background: true})
				collection.createIndex("archivesComponentDb", {background: true})




				if (cb) cb()

			})
		})

	}
}

