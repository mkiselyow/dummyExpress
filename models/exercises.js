const { database } = require('../db.js')
const User = require('./user.js')

class Exercises {
  async create (data) {
    let result = {} // todo: remove duplication of 'user not found'
    const userResponse = await User.get(data.userId)

    if ((userResponse.status === 404)) {
      result.status = 404
      result.errors = 'user not found'
    } else {
      result = await database.create('exercises', data)
      const { _id, description, userId, duration, date } = data
      result.data = {
        userId,
        exerciseId: _id,
        duration,
        description,
        date
      }
    }

    return result
  }

  async paginate ({ from, to, limit, userId }) {
    let result = {} // todo: remove duplication of 'user not found'
    const userResponse = await User.get(userId)

    if ((userResponse.status === 404)) {
      result.status = 404
      result.errors = 'user not found'
    } else {
      result = await database.paginate('exercises', {from, to, limit})

      result.data.logs = result.data.logs?.map(({_id, description, duration, date}) => ({
        id: _id,
        description,
        duration,
        date
      }))
    }

    return result
  }
}

module.exports = new Exercises()
