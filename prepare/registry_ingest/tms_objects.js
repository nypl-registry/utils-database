var clc = require('cli-color')
var async = require('async')

module.exports = function (db) {
  return function (callback) {
    // remove the any old stuff
    db.databaseConnectRegistryIngest(function () {
      var collection = db.databaseRegistryIngest.collection('tmsObjects')

      // delete any existing data first
      collection.drop(function (err, results) {
        if (err) {
          if (err.message !== 'ns not found') {
            console.log(clc.redBright('prepareIngestTmsObject - drop collection'), clc.greenBright(err), console.dir(err))
          }
        }

        // now prepare the indexes
        // collection.createIndex('objectNumber', {background: true})
        // collection.createIndex('imageId', {background: true})
        // collection.createIndex('bNumber', {background: true})
        // collection.createIndex('callNumber', {background: true})
        // collection.createIndex('division', {background: true})
        // collection.createIndex('classmark', {background: true})
        // collection.createIndex('objectID', {background: true})
        // collection.createIndex('acquisitionNumber', {background: true})
        // collection.createIndex('matchedMms', {background: true})

        collection.createIndex({'title': 'text'}, {background: true})
        collection.createIndex({'titleAlt': 'text'}, {background: true})

        async.each(['objectNumber', 'imageId', 'bNumber', 'callNumber', 'division', 'classmark', 'objectID', 'acquisitionNumber', 'matchedMms'], function (index, eachCallback) {
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
