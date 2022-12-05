const { database } = require('../db.js')
const User = require('./user.js')
const { body, param, query } = require('express-validator')
const { ObjectId } = require('mongodb')

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
      result = await database.paginate('exercises', {from, to, limit, userId})

      result.data.logs = result.data.logs?.map(({_id, description, duration, date}) => ({
        id: _id,
        description,
        duration,
        date
      }))
    }

    return result
  }

  validate () {
    return [
      param('userId', 'user id isn\'t correct')
        .custom((userId) => {
          if (!ObjectId.isValid(userId)) throw new Error('user id isn\'t valid')

          return User.get(userId).then((user) => {
            if (user.status !== 404) {
              return Promise.reject('user id isn\'t correct')
            }
          })
        }),
      body('date', 'duration should be a valid date')
        .optional()
        .isISO8601()
        .toDate(),
      body('description', 'description is required')
        .trim()
        .notEmpty()
        .isLength({ min: 10, max: 250 })
        .withMessage('description length should be 2 - 250 chars'),
      body('duration', 'duration is required and should be between 1 and 999999')
        .isInt({ min: 1, max: 999999 })
    ]
  }

  validatePagination () {
    return [
      param('userId', 'user id isn\'t correct')
        .custom((userId) => {
          if (!ObjectId.isValid(userId)) throw new Error('user id isn\'t valid')

          return User.get(userId).then((user) => {
            if (user.status !== 404) {
              return Promise.reject('user id isn\'t correct')
            }
          })
        }),
      query('from', 'from should be a valid date')
        .optional()
        .isISO8601()
        .toDate(),
      query('to', 'to should be a valid date')
        .optional()
        .isISO8601()
        .toDate(),
      query('limit', 'limit is not valid')
        .optional()
        .isInt({ min: 1, max: 999999 })
    ]
  }
}

module.exports = new Exercises()
