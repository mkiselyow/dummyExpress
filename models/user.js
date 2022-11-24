const { database } = require('../db.js')

class User {
  async get (id) {
    const result = await database.get('users', id)
    if (result.status === 200) {
      result.data = {
        id: result.data._id.toString(),
        username: result.data.username
      }
    }
    return result
  }

  async getAll () {
    const result = await database.getAll('users')
    result.data = result.data.map(({ _id, username}) => ({ id: _id.toString(), username }))
    return result
  }

  async create (data) {
    const result = await database.create('users', data)
    const { _id, username } = data
    result.data = {
      id: _id.toString(),
      username
    }
    return result
  }
}

module.exports = new User()
