var clc = require('cli-color')
var async = require('async')

module.exports = function (db) {
  return function (callback) {
    db.databaseConnectRegistryIngest(function () {
      // remove the any old stuff
      var collection = db.databaseRegistryIngest.collection('fast')
      console.log('Dropping Table')
      // delete any existing data first
      collection.drop(function (err, results) {
        console.log('fast Table dropped')
        if (err) {
          if (err.message !== 'ns not found') {
            console.log(clc.redBright('prepare fast - drop collection'), clc.greenBright(err), console.dir(err))
          }
        }

        var collection = db.databaseRegistryIngest.collection('fast')

        console.log('Creating Indexes')
        // now prepare the indexes
        async.each(['normalized', 'sameAsLc'], function (index, eachCallback) {
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
