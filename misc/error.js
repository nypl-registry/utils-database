var clc = require('cli-color')

module.exports = function (db) {
  return function (context, error) {
    db.databaseConnectRegistryIngest(function () {
      if (!db.collectionLookup['errors']) {
        var collection = db.databaseRegistryIngest.collection('errors')
        db.collectionLookup['errors'] = collection
      }

      console.log(clc.black.bgRedBright(context), clc.black.bgRedBright(error))

      var insert = {
        date: new Date().toString(),
        context: context,
        error: error
      }
      // store the new data
      db.collectionLookup['errors'].insert(insert, function (err, result) {
        if (err) console.log(err)
      })
    })
  }
}
