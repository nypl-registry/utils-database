var clc = require('cli-color')

module.exports = function (db) {
  return function (callback) {
    // remove the any old stuff
    db.databaseConnectRegistryIngest(function () {
      var collection = db.databaseRegistryIngest.collection('archivesComponents')

      // delete any existing data first
      collection.drop(function (err, results) {
        if (err) {
          if (err.message !== 'ns not found') {
            console.log(clc.redBright('prepareIngestArchivesComponents - drop collection'), clc.greenBright(err), console.dir(err))
          }
        }

        // now prepare the indexes
        collection.createIndex('mssDb', {background: true})
        collection.createIndex('mss', {background: true})
        collection.createIndex('bNumber', {background: true})
        collection.createIndex('callNumber', {background: true})
        collection.createIndex('collectionDb', {background: true})
        collection.createIndex('orderSequence', {background: true})
        collection.createIndex('divisions', {background: true})
        collection.createIndex('uuid', {background: true})
        collection.createIndex('levelText', {background: true})

        if (callback) callback()
      })
    })
  }
}
