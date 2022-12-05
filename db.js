const { MongoClient, ServerApiVersion } = require('mongodb');
const username = 'm001-student';
const password = 'm001-mongodb-basics';
const uri = `mongodb+srv://${username}:${password}@sandbox.uuwsva5.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

module.exports.database = {
  async _connection (collection, callback) {
    let result = {
      data: {},
      status: 200
    }
    try {
      await client.connect()
      const database = client.db('sample_users')
      const collectionRef = database.collection(collection)
      result.data = await callback(collectionRef)
    } catch (e) {
      if (e.message === 'Document failed validation') {
        // expected errors
        result.status = 400
        result.errors = e.errInfo.details
      } else {
        // unexpected errors
        result.status = 500
        result.errors = e.message || e
      }
    } finally {
      await client.close();
    }
    return result
  },

  async get (collectionName, id) {
    const result = await this._connection(collectionName, (collection) => collection.findOne({ _id: id }))
    if (result.data === null) {
      result.status = 404
      result.errors = 'not found'
    }
    return result
  },

  async getByProp (collectionName, propName, propValue) {
    const result = await this._connection(
      collectionName,
      (collection) => collection.findOne({ [propName]: propValue })
    )
    if (result.data === null) {
      result.status = 404
      result.errors = 'not found'
    }
    return result
  },

  async getAll (collectionName) {
    return this._connection(collectionName, (collection) => collection.find({}).toArray())
  },

  async create (collectionName, entity) {
    const result = await this._connection(collectionName, (collection) => collection.insertOne(entity))
    result.data = result.data?.insertedId ? result.data.insertedId : result.data
    return result
  },

  async paginate (collectionName, {from, to, limit, userId}) {
    const searchParams = {
      userId: userId
    }
    if (from) {
      searchParams.date = {
        $gte: from
      }
    }
    if (to) {
      if (searchParams.date) {
        searchParams.date = {
          ...searchParams.date,
          $lte: to
        }
      } else {
        searchParams.date = {
          $lte: to
        }
      }
    }

    let logs = null
    if (limit) {
      logs = await this._connection(collectionName,
        (collection) => collection
          .find(searchParams)
          .sort({ date: 1 })
          .limit( limit )
          .toArray()
      )
    } else {
      logs = await this._connection(collectionName,
        (collection) => collection
          .find(searchParams)
          .sort({ date: 1 })
          .toArray()
      )
    }

    const count = await this._connection(collectionName,
      (collection) => collection
        .find(searchParams)
        .count()
      )

    return {
      data: {
        logs: logs.data,
        count: count.data
      },
      status: logs.status,
      errors: logs.errors,
    };
  }
}
