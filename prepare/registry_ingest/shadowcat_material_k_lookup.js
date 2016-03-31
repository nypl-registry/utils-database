var clc = require('cli-color')

module.exports = function (db) {
  return function (callback) {
    // remove the any old stuff
    db.databaseConnectRegistryIngest(function () {
      var collection = db.databaseRegistryIngest.collection('shadowcatMaterialKLookupTEST')

      // delete any existing data first
      collection.drop(function (err, results) {
        if (err) {
          if (err.message !== 'ns not found') {
            console.log(clc.redBright('shadowcatMaterialKLookup - drop collection'), clc.greenBright(err), console.dir(err))
          }
        }

        // now prepare the indexes
        collection.createIndex('sc:callnumber', {background: true}, function (err, results) {
          if (err) console.log(err)

          if (callback) callback()
        })
      })
    })
  }
}
