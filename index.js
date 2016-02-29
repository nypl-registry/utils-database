var os = require("os")
var crypto = require("crypto")
var path = require("path")
var fs = require("fs")

var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID
var async = require("async")



function Database() {

	//test for the env variable set to know what server to use
	if (!process.env.NODE_ENV){
		throw new Error("Unset NODE_ENV var: The NODE_ENV enviorment variable is not set.\nSet it to 'production' or 'development' type: 'export NODE_ENV=development' ")
	}
	if (process.env.NODE_ENV!='production'&&process.env.NODE_ENV!='development'){
		throw new Error("Unset NODE_ENV var: The NODE_ENV enviorment variable is not set.\nSet it to 'production' or 'development' type: 'export NODE_ENV=development' ")
	}

	//look to see if we can find the private key
	//in their ssh folder
	try{
		fs.statSync(os.homedir() +"/.ssh/registry_node_server_info")
		this.privateKeyPath = os.homedir() +"/.ssh/registry_node_server_info"
	}catch (e) {
		//try just the user folder
		try{
			fs.statSync(os.homedir() +"/registry_node_server_info")
			this.privateKeyPath = os.homedir() +"/registry_node_server_info"
		}catch (e) {
			throw new Error("Could not locate the private key for the server credentails. Put the private key in your user .ssh directory: " + os.homedir() +"/.ssh/registry_node_server_info" + " Or just in your user directory: " + os.homedir() +"/registry_node_server_info" )
		}
	}

	//the encrypted server ips
	this.serverInfo = "elkYrjwAwdPhZYoJ4rwgry1mAXq/yPWPshd+GlQAWPWT988E1Fv5H2eb6R77WuBjFdklA9qCx8YnfglZfpICJRUz4PsgRg9lAHL2shCv+8zh/GnXExn2pfC7eROM5RjN6gUdRjr5F1wp5pjALbtQvbfJDVC0PlgJyjrbZG08uqMCDfN28md6/Fxxoq1YIjOArDt3rPCe6IHjZ/uSsz6DIiwUGFoIh1Us+ZkIeizTy3qEexjVFH/xQvFB5Qa2YDAHHlYQEViYOqiDc0WqYUZlwyM5nqLobGi7lQbXZjFPLbAGvKA/l2UHBvuLZZl2gei0oZ5xPMF1iF4Vzg4+JQ9Ilw=="

	//where we store the database objects
	this.databaseRegistryIngest = null
	this.databaseShadowcat = null
	this.databaseTripleStore = null
	this.collectionLookup = {}
	this.collectionLookupTripleStore = {}


	/**
	 * Builds all the crypto stuff needed to add the database credentails to this library
	 *
	 * @param  {object} serverCreds - The server credentials to encrypt
	 * @return {string}
	 */
	this.buildServerConfig = function(serverCreds){
		var encryptStringWithRsaPublicKey = function(toEncrypt, relativeOrAbsolutePathToPublicKey) {
			var absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey)
			var publicKey = fs.readFileSync(absolutePath, "utf8")
			var buffer = new Buffer(toEncrypt)
			var encrypted = crypto.publicEncrypt(publicKey, buffer)
			return encrypted.toString("base64")
		}
		serverCreds = encryptStringWithRsaPublicKey(JSON.stringify(serverCreds), __dirname + "/registry_node_server_info.pem")
		return serverCreds
	}

	/**
	 * Decrypts the server info and returns it as a string.
	 *
	 * @return {string}
	 */
	this.setServerConfig = function(){
		var decryptStringWithRsaPrivateKey = function(toDecrypt, relativeOrAbsolutePathtoPrivateKey) {
			var absolutePath = path.resolve(relativeOrAbsolutePathtoPrivateKey)
			var privateKey = fs.readFileSync(absolutePath, "utf8")
			var buffer = new Buffer(toDecrypt, "base64")
			var decrypted = crypto.privateDecrypt(privateKey, buffer)
			return decrypted.toString("utf8")
		}
		return decryptStringWithRsaPrivateKey(this.serverInfo, this.privateKeyPath )
	}


	//Basic DB stuff:

	/**
	 * Connect to the database and set its connection to the instance obj or returned the stored connection
	 *
	 * @param  {function} cb - the function to pass the database connection
	 */
	this.databaseConnectRegistryIngest = function(cb){
		if (this.databaseRegistryIngest){
			if (cb) cb()
			return true
		}
		MongoClient.connect(this.registryIngestServer, function(err, dbConnection) {
			if (err){
				console.log("Error connecting to registry:",err)
				throw new Error("Error connecting to registry ingest")
			}else{
				console.log("[DB]:Connecting to Registry Ingest")
				exports.databaseRegistryIngest = dbConnection
			}
			if (cb) cb()
		})
	}

	/**
	 * Connect to the database and set its connection to the instance obj or returned the stored connection
	 *
	 * @param  {function} cb - the function to pass the database connection
	 */
	this.databaseConnectRegistryTripleStore = function(cb){
		if (this.databaseTripleStore){
			if (cb) cb()
			return true
		}
		MongoClient.connect(this.registryTripleStoreServer, function(err, dbConnection) {
			if (err){
				console.log("Error connecting to triple store:",err)
				throw new Error("Error connecting to registry triple store")
			}else{
				console.log("[DB]:Connecting to Registry Triple Store")
				exports.databaseTripleStore = dbConnection
			}
			if (cb) cb()
		})
	}

	/**
	 * Connect to the database and set its connection to the instance obj or returned the stored connection
	 *
	 * @param  {function} cb - the function to pass the database connection
	 */
	this.databaseConnectShadowcat = function(cb){
		if (this.databaseShadowcat){
			if (cb) cb()
			return true
		}
		MongoClient.connect(this.shadowcatServer, function(err, dbConnection) {
			if (err){
				console.log("Error connecting to shadowcat:",err)
				throw new Error("Error connecting to shadowcat")
			}else{
				console.log("[DB]:Connecting to Shadowcat")
				exports.databaseShadowcat = dbConnection
			}
			if (cb) cb()
		})
	}

	/**
	 * Close all the possible active database connections, will need to call this to ensure script's execution is terminated
	 *
	 * @param  {function} cb - the function when all databases are closed
	 */
	this.databaseClose = function(cb){
		if (this.databaseRegistryIngest) this.databaseRegistryIngest.close()
		if (this.databaseShadowcat) this.databaseShadowcat.close()
		if (this.databaseTripleStore) this.databaseTripleStore.close()
		if (cb) cb()
	}


	/**
	 * return a collection requested, resuing the same DB connection and collection reference when possible
	 *
 	 * @param  {string} collectionName - the collection requestd
	 * @param  {function} cb - returns the collection
	 */
	this.returnCollectionShadowcat = function(collectionName,cb){
		this.databaseConnectShadowcat(function(){

			if (exports.collectionLookup[collectionName]){
				cb(null,exports.collectionLookup[collectionName])
			}else{
				var collection = exports.databaseShadowcat.collection(collectionName)
				exports.collectionLookup[collectionName] = collection
				cb(null,exports.collectionLookup[collectionName])
			}

		})
	}

	/**
	 * return a collection requested, resuing the same DB connection and collection reference when possible
	 *
 	 * @param  {string} collectionName - the collection requestd
	 * @param  {function} cb - returns the collection
	 */
	this.returnCollectionRegistry = function(collectionName,cb){
		this.databaseConnectRegistryIngest(function(){
			if (exports.collectionLookup[collectionName]){
				cb(null,exports.collectionLookup[collectionName])
			}else{
				var collection = exports.databaseRegistryIngest.collection(collectionName)
				exports.collectionLookup[collectionName] = collection
				cb(null,exports.collectionLookup[collectionName])
			}
		})
	}

	/**
	 * return a collection requested, resuing the same DB connection and collection reference when possible
	 *
	 * @param  {string} collectionName - the collection requestd
	 * @param  {function} cb - returns the collection
	 */
	this.returnCollectionTripleStore = function(collectionName,cb){
		this.databaseConnectTripleStore(function(){
			if (exports.collectionLookupTripleStore[collectionName]){
				cb(null,exports.collectionLookupTripleStore[collectionName])
			}else{
				var collection = exports.databaseTripleStore.collection(collectionName)
				exports.collectionLookupTripleStore[collectionName] = collection
				cb(null,exports.collectionLookupTripleStore[collectionName])
			}
		})
	}

	/**
	 * One stop shopping , ask for any collections you may need and return them togather
	 *
	 * @param  {object} collectionNames - the collections requested in this format: { shadowcat: ['bib','item'], registryIngest: ['tmsObjects'], registryTripleStore: ['agents'] }
	 * @param  {function} cb - returns the collection
	 */
	this.returnCollections = function(collectionsName,cb){

		//what gets sent back
		returnCollections = { shadowcat : {}, registryIngest: {}, registryTripleStore: {}}

		//see which databases we need to be sure are available before getting the collections
		async.parallel({
			shadowcat: function(callback){
				if (collectionsName.shadowcat && collectionsName.shadowcat.length>0){
					exports.databaseConnectShadowcat(function(){
						callback(null,null)
					})
				}else{
					callback(null,null)
				}
			},
			registryIngest: function(callback){
				if (collectionsName.registryIngest && collectionsName.registryIngest.length>0){
					exports.databaseConnectRegistryIngest(function(){
						callback(null,null)
					})
				}else{
					callback(null,null)
				}
			},
			registryTripleStore: function(callback){
				if (collectionsName.registryTripleStore && collectionsName.registryTripleStore.length>0){
					exports.databaseConnectRegistryTripleStore(function(){
						callback(null,null)
					})
				}else{
					callback(null,null)
				}
			}

		}, function(err,results){

			//loop through each one and grab the requeted collections

			if (collectionsName.shadowcat && collectionsName.shadowcat.length>0){
				collectionsName.shadowcat.forEach(c => {
					if (exports.collectionLookup[c]){
						returnCollections.shadowcat[c] = exports.collectionLookup[c]
					}else{
						var collection = exports.databaseShadowcat.collection(c)
						exports.collectionLookup[c] = collection
						returnCollections.shadowcat[c] = exports.collectionLookup[c]
					}
				})
			}

			if (collectionsName.registryIngest && collectionsName.registryIngest.length>0){
				collectionsName.registryIngest.forEach(c => {
					if (exports.collectionLookup[c]){
						returnCollections.registryIngest[c] = exports.collectionLookup[c]
					}else{
						var collection = exports.databaseRegistryIngest.collection(c)
						exports.collectionLookup[c] = collection
						returnCollections.registryIngest[c] = exports.collectionLookup[c]
					}
				})
			}

			if (collectionsName.registryTripleStore && collectionsName.registryTripleStore.length>0){
				collectionsName.registryTripleStore.forEach(c => {
					if (exports.collectionLookup[c]){
						returnCollections.registryTripleStore[c] = exports.collectionLookup[c]
					}else{
						var collection = exports.databaseTripleStore.collection(c)
						exports.collectionLookup[c] = collection
						returnCollections.registryTripleStore[c] = exports.collectionLookup[c]
					}
				})
			}


			cb(null,returnCollections)


		})


	}

	/**
	 * Returns a BULK instance for a specified collection in the triple store
	 *
	 * @param  {object} collectionNames - the collection name in the triple store
	 * @param  {function} cb - returns the bulk instance
	 */
	this.newTripleStoreBulkOp = function(col,cb){
		this.databaseConnectRegistryTripleStore(function(){
			var collection = exports.databaseTripleStore.collection(col)
			var bulk = collection.initializeUnorderedBulkOp()
			cb(bulk)
		})
	}

	/**
	 * Returns a BULK instance for a specified collection in the triple store
	 *
	 * @param  {object} collectionNames - the collection name in the triple store
	 * @param  {function} cb - returns the bulk instance
	 */
	this.newRegistryIngestBulkOp = function(col,cb){
		this.databaseConnectRegistryIngest(function(){
			var collection = exports.databaseRegistryIngest.collection(col)
			var bulk = collection.initializeUnorderedBulkOp()
			cb(bulk)
		})
	}


	//these are the  prepare functions for the differnt collections, drop/create/indexes, stuff like that
	this.prepareRegistryIngestAgents = require(__dirname + '/prepare/registry_ingest/agents')(this)
	this.prepareRegistryIngestTerms = require(__dirname + '/prepare/registry_ingest/terms')(this)
	this.prepareRegistryIngestMmsCaptures = require(__dirname + '/prepare/registry_ingest/mms_captures')(this)
	this.prepareRegistryIngestMmsCollections = require(__dirname + '/prepare/registry_ingest/mms_collections')(this)
	this.prepareRegistryIngestMmsContainers = require(__dirname + '/prepare/registry_ingest/mms_containers')(this)
	this.prepareRegistryIngestMmsItems = require(__dirname + '/prepare/registry_ingest/mms_items')(this)
	this.prepareRegistryIngestArchivesCollections = require(__dirname + '/prepare/registry_ingest/archives_collections')(this)
	this.prepareRegistryIngestArchivesComponents = require(__dirname + '/prepare/registry_ingest/archives_components')(this)
	this.prepareRegistryIngestTmsObjects = require(__dirname + '/prepare/registry_ingest/tms_objects')(this)
	this.prepareViaf = require(__dirname + '/prepare/registry_ingest/viaf')(this)

	this.prepareRegistryTripleStoreAgents = require(__dirname + '/prepare/registry_store/agents')(this)
	this.prepareRegistryTripleStoreResources = require(__dirname + '/prepare/registry_store/resources')(this)



	/**
	 * Sends a error report to the error collection
	 *
	 * @param  {string} context - Where did this error happen?
	 * @param  {string} error - What was the error?
	 */
	this.logError = require(__dirname + '/misc/error')(this)

	//this is a legacy export feature. TODO make data paths better.
	this.exportPDItemsRaw = require(__dirname + '/misc/pd_export_raw')(this)




	//Init.

	//store the credentials
	this.serverCreds = JSON.parse(this.setServerConfig())
	//set the IPs to use
	if (process.env.NODE_ENV=='production'){
		this.registryIngestServer  = `mongodb://${this.serverCreds.rip}:27017/registry`
		this.registryTripleStoreServer  = `mongodb://${this.serverCreds.rsp}:27017/registry`
		this.shadowcatServer  = `mongodb://${this.serverCreds.sp}:27017/shadowcat`
		this.elasticServer  = this.serverCreds.ep
	}
	if (process.env.NODE_ENV=='development'){
		this.registryIngestServer  = `mongodb://${this.serverCreds.rid}:27017/registry`
		this.registryTripleStoreServer  = `mongodb://${this.serverCreds.rsd}:27017/registry`
		this.shadowcatServer  = `mongodb://${this.serverCreds.sd}:27017/shadowcat`
		this.elasticServer  = this.serverCreds.ed
	}




}

module.exports = exports = new Database()