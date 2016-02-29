# utils-database
The database layer utilities

This module contains methods to interact with the mongo databases across three servers: the registry ingest, the registry triple store and shadowcat. 

Encrypted credentails are also stored in this module for the these servers and elasticsearch. You need to have the private key in your user folder (.ssh or root user folder) for the system to decrypt the server credentails.

You need to have the NODE_ENV enviormental varaible set to "production" or "development" 
```export NODE_ENV=development```
If set to development the IP address will be the public IPs of the servers (you will need to have your IP whitelisted)
If set to production the IPs will be the private network IPs.

Example:
```
var db = require("nypl-registry-utils-database")

db.returnCollectionTripleStore("agents",function(err,collection){
  collection.find({uri:1234567890}).toArray(function(err,results){
    results.forEach(x => console.log(x))
  })
})
```

There is also a method that can gather mutliple collections across all the systems in one callback:
```
var db = require("nypl-registry-utils-database")

db.returnCollections({ shadowcat: ['bib','item'], registryIngest: ['tmsObjects'], registryTripleStore: ['agents'] } ,function(err,collections){
  collections.shadowcat.bib.count((err, count) => console.log(count))
  collections.registryIngest.tmsObjects.count((err, count) => console.log(count))
  collections.registryTripleStore.agents.count((err, count) => console.log(count))

})
```
There are also the "prepare" methods that get mongo collections ready by dropping the collection, creating it, adding indexes. If you need to add a new index you would do so in here, located in ./prepare/registry_ingest/*



