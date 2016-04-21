var clc = require('cli-color')
var async = require('async')

module.exports = function (db) {
  return function (callback) {
    db.databaseConnectRegistryIngest(function () {
      // remove the any old stuff
      var collection = db.databaseRegistryIngest.collection('agents')
      console.log('Dropping Table')
      // delete any existing data first
      collection.drop(function (err, results) {
        console.log('agents Table dropped')
        if (err) {
          if (err.message !== 'ns not found') {
            console.log(clc.redBright('prepare agents - drop collection'), clc.greenBright(err), console.dir(err))
          }
        }

        var collection = db.databaseRegistryIngest.collection('agents')

        console.log('Creating Indexes')
        // now prepare the indexes
        // collection.createIndex('viaf', {background: true, unique: true})
        // collection.createIndex('viafAll', {background: true})
        // collection.createIndex('registry', {background: true, unique: true})
        // collection.createIndex('nameControlled', { background: true, unique: true })
        // collection.createIndex('nameNormalized', {background: true})
        // if (callback) callback()

        var uniques = {'viaf': true, 'registry': true, 'nameControlled': true}

        async.each(['viaf', 'registry', 'nameControlled', 'nameNormalized', 'lcId'], function (index, eachCallback) {
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
