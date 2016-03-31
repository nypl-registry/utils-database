var clc = require('cli-color')
var async = require('async')

module.exports = function (db) {
  return function (callback) {
    // remove the any old stuff
    db.databaseConnectRegistryIngest(function () {
      // remove the any old stuff
      var collection = db.databaseRegistryIngest.collection('terms')
      console.log('Dropping Table')
      // delete any existing data first
      collection.drop(function (err, results) {
        console.log('terms Table dropped')
        if (err) {
          if (err.message !== 'ns not found') {
            console.log(clc.redBright('prepare terms - drop collection'), clc.greenBright(err), console.dir(err))
          }
        }

        var collection = db.databaseRegistryIngest.collection('terms')

        console.log('Creating Indexes')
        // collection.createIndex('fast', {background: true, unique: true})
        // collection.createIndex('fastAll', {background: true, unique: true})
        // collection.createIndex('registry', {background: true, unique: true})
        // collection.createIndex('termControlled', {background: true, unique: true})
        // collection.createIndex('termNormalized', {background: true})

        var uniques = {'fast': true, 'fastAll': true, 'registry': true, 'termControlled': true}

        async.each(['fast', 'fastAll', 'registry', 'termControlled', 'termNormalized'], function (index, eachCallback) {
          collection.createIndex(index, {background: true, unique: (uniques[index])}, function (err, results) {
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
