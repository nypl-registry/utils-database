var clc = require('cli-color')
var async = require('async')

module.exports = function (db) {
  return function (callback) {
    // remove the any old stuff
    db.databaseConnectRegistryIngest(function () {
      var collection = db.databaseRegistryIngest.collection('archivesCollections')

      // delete any existing data first
      collection.drop(function (err, results) {
        if (err) {
          if (err.message !== 'ns not found') {
            console.log(clc.redBright('prepareIngestArchivesCollections - drop collection'), clc.greenBright(err), console.dir(err))
          }
        }

        // now prepare the indexes
        // collection.createIndex('mssDb', {background: true})
        // collection.createIndex('mss', {background: true})
        // collection.createIndex('bNumber', {background: true})
        // collection.createIndex('callNumber', {background: true})
        // collection.createIndex('divisions', {background: true})
        // collection.createIndex('uuid', {background: true})

        async.each(['mssDb', 'mss', 'bNumber', 'callNumber', 'divisions', 'uuid'], function (index, eachCallback) {
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
