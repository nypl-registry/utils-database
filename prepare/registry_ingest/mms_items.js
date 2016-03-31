var clc = require('cli-color')
var async = require('async')

module.exports = function (db) {
  return function (callback) {
    // remove the any old stuff
    db.databaseConnectRegistryIngest(function () {
      var collection = db.databaseRegistryIngest.collection('mmsItems')

      // delete any existing data first
      collection.drop(function (err, results) {
        if (err) {
          if (err.message !== 'ns not found') {
            console.log(clc.redBright('prepareIngestMmsItems - drop collection'), clc.greenBright(err), console.dir(err))
          }
        }

        // now prepare the indexes
        // collection.createIndex('mmsDb', {background: true})
        // collection.createIndex('bNumber', {background: true})
        // collection.createIndex('callNumber', {background: true})
        // collection.createIndex({'title': 'text'}, {background: true})
        // collection.createIndex('collectionUuid', {background: true})
        // collection.createIndex('containerUuid', {background: true})
        // collection.createIndex('publicDomain', {background: true})
        // collection.createIndex('parents', {background: true})
        // collection.createIndex('archivesComponentDb', {background: true})

        collection.createIndex({'title': 'text'}, {background: true})

        async.each(['mmsDb', 'bNumber', 'callNumber', 'collectionUuid', 'containerUuid', 'publicDomain', 'parents', 'archivesComponentDb'], function (index, eachCallback) {
          collection.createIndex(index, {background: true}, function (err, results) {
            if (err) console.log(err)
            eachCallback()
          })
        }, function (err, results) {
          if (err) console.log(err)
          if (callback) callback()
        })
      })
    })
  }
}
