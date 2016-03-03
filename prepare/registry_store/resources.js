var clc = require('cli-color')

module.exports = function (db) {
  return function (callback) {
    db.databaseConnectRegistryTripleStore(function () {
      // remove the any old stuff
      var collection = db.databaseTripleStore.collection('resourcesStage')
      console.log('Dropping Table')
      // delete any existing data first
      collection.drop(function (err, results) {
        console.log('resources Table dropped')
        if (err) {
          if (err.message !== 'ns not found') {
            console.log(clc.redBright('prepare resources - drop collection'), clc.greenBright(err), console.dir(err))
          }
        }

        var collection = db.databaseTripleStore.collection('resources')

        console.log('Creating Indexes')
        // now prepare the indexes
        collection.createIndex('allAgents', {background: true})
        collection.createIndex('allTerms', {background: true})
        collection.createIndex('uri', {background: true, unique: true})
        collection.createIndex('dcterms:identifier.objectUri', {background: true})

        if (callback) callback()
      })
    })
  }
}
