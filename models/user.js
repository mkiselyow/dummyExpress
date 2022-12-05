const { database } = require('../db.js')
const { body } = require('express-validator/check')

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

  validate () {
    return [
      body('username', 'username is a required parameter')
        .trim()
        .notEmpty()
        .bail()
        .isLength({ min: 2, max: 250 })
        .withMessage('username length should be 2 - 250 chars')
        .bail()
        .custom((value, { req }) => {
          return database.getByProp('users', 'username', value).then((user) => {
            if (user.status !== 404) {
              return Promise.reject('username should be unique')
            }
          })
        })
    ]
  }
}

module.exports = new User()
