
module.exports = function(db){


	return function(context,error){

	 	//remove the existing file
	 	fs.writeFileSync('data/pd_mms_items.ndjson', "")
	 	fs.writeFileSync('data/pd_mms_items_missing_from_dc.ndjson', "")

	 	var solr_uuids = fs.readFileSync('data/pd-item-uuids.csv', "utf8")
	 	solr_uuids=solr_uuids.split("\n")
	 	console.log(solr_uuids.length)

	 	db.databaseConnectRegistryIngest(function(){

	 		db.returnCollectionRegistry("mmsCollections",function(err,mmsCollections){

	 			var collectionLookup = {}
	 			console.log("Building Collection Title Lookup...")
	 			//build a quick lookup
				mmsCollections.find({ }, { title: 1}).toArray(function(err, collections){

					collections.forEach(function(c){
						collectionLookup[c._id] = c.title
					})

					db.returnCollectionRegistry("mmsCaptures",function(err,mmsCaptures){

						// //loop through the items
			 			db.returnCollectionRegistry("mmsItems",function(err,mmsItems){

							var c = 0
							var capturesCount = 0
							var cursor = mmsItems.find({ publicDomain : true, dcFlag: true  })

							//send the data to the calling function with the cursor
							cursor.on('data', function(doc) {

								cursor.pause()

				 				var title =""
								//if (col) if (col[0]) if (col[0].title) title = col[0].title
								if (collectionLookup[doc.collectionUuid]){
									title = collectionLookup[doc.collectionUuid]
								}

				 				doc.collectionTitle = title

				 				//get the capture uuids
				 				mmsCaptures.find({ itemUuid: doc._id }).toArray(function(err, captures){

				 					doc.captures = []

				 					if (captures){
					 					captures.forEach(function(cap){
					 						doc.captures.push({  uuid: cap._id, imageId : cap.imageId })
					 						capturesCount++
					 					})
					 				}

									//console.log(doc)
					 				var out = JSON.stringify(doc)
					 				c++


					 				if (solr_uuids.indexOf(doc._id)===-1){

						 				fs.appendFile('data/pd_mms_items_missing_from_dc.ndjson', out + "\n", function (err) {

						 				})

					 				}

					 				fs.appendFile('data/pd_mms_items.ndjson', out + "\n", function (err) {
					 					cursor.resume()
					 					console.log(c,capturesCount)
					 				})



				 				})



							})

							cursor.once('end', function() {

								//db.databaseClose()
							})

						})
					})

		 		})

	 		})

	 	})




	}
}
