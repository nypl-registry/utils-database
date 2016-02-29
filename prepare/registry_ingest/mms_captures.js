var clc = require('cli-color')

module.exports = function(db){


	return function(callback){

		//remove the any old stuff
		db.databaseConnectRegistryIngest(function(){


			var collection = db.databaseRegistryIngest.collection('mmsCaptures')

			//delete any existing data first
			collection.drop(function(err,results){
				if (err){
					if (err.message != 'ns not found'){
						console.log(clc.redBright('prepareIngestMmsCaptures - drop collection'), clc.greenBright(err), console.dir(err))
					}
				}

				//now prepare the indexes
				collection.createIndex("mmsDb", {background: true})
				collection.createIndex("itemMmsDb", {background: true})
				collection.createIndex("itemUuid", {background: true})
				collection.createIndex("collectionMmsDb", {background: true})
				collection.createIndex("containerMmsDb", {background: true})
				collection.createIndex("uuid", {background: true})
				collection.createIndex("imageId", {background: true})

				if (cb) cb()
			})
		})

	}
}

