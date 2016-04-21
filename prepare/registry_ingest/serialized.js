var clc = require('cli-color')

module.exports = function (db) {
  return function (callback) {
    // remove the any old stuff
    db.databaseConnectRegistryIngest(function () {
      // remove the any old stuff
      var collection = db.databaseRegistryIngest.collection('serialized')
      console.log('Dropping Collection')
      // delete any existing data first
      collection.drop(function (err, results) {
        console.log('serialized Collection dropped')
        if (err) {
          if (err.message !== 'ns not found') {
            console.log(clc.redBright('prepare serialized - drop collection'), clc.greenBright(err), console.dir(err))
          }
        }

        // var collection = db.databaseRegistryIngest.collection('serialized')

        console.log('Creating Indexes')
        if (callback) callback()

        // var uniques = {'fast': true, 'fastAll': true, 'registry': true, 'termControlled': true}

      // async.each(['fast', 'fastAll', 'registry', 'termControlled', 'termNormalized'], function (index, eachCallback) {
      //   collection.createIndex(index, {background: true, unique: (uniques[index])}, function (err, results) {
      //     if (err) console.log(err)
      //     eachCallback()
      //   })
      // }, function (err, results) {
      //   if (err) console.log(err)
      //   if (callback) callback()
      // })
      })
    })
  }
}
