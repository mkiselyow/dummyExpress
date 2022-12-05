const express = require('express')
const app = express()
const cors = require('cors')
const User = require('./models/user.js')
const Exercises = require('./models/exercises.js')
const { ObjectId } = require('mongodb')
const bodyParser = require('body-parser');
const { validationResult } = require('express-validator')

require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.json()) // parses request body
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users/:userId', async (req, res) => {
  if (ObjectId.isValid(req.params.userId)) { // todo: move 'ObjectId.isValid handling' to guard function
    const result = await User.get(new ObjectId(req.params.userId))
    res.status(result.status).json(result.errors || result.data)
  } else {
    res.status(400).json('invalid id')
  }
});

app.get('/api/users', async (req, res) => {
  const result = await User.getAll()
  res.status(result.status).json(result.errors || result.data)
});


app.post('/api/users',
  User.validate(),
  async (req, res) => {
    handleValidation(req, res)

    const result = await User.create({ username: req.body.username ? req.body.username.trim() : undefined })
    res.status(result.status).json(result.errors || result.data)
  });

app.post('/api/users/:userId/exercises',
  Exercises.validate(),
  async (req, res) => {
    handleValidation(req, res)

    if (ObjectId.isValid(req.params.userId)) { // todo: move 'ObjectId.isValid handling' to guard function
      const result = await Exercises.create({
        description: req.body.description ? req.body.description.trim() : undefined,
        duration: req.body.duration ? Number(req.body.duration) : undefined,
        date: req.body.date ? (new Date(req.body.date)) : (new Date()),
        userId: new ObjectId(req.params.userId)
      })
      res.status(result.status).json(result.errors || result.data)
    } else {
      res.status(400).json('invalid userId')
    }
  }
);

app.get('/api/users/:userId/logs',
  Exercises.validatePagination(),
  async (req, res) => {
    handleValidation(req, res)

    if (ObjectId.isValid(req.params.userId)) { // todo: move 'ObjectId.isValid handling' to guard function
      const result = await Exercises.paginate({
        from: req.query.from ? (new Date(req.query.from)) : null,
        to: req.query.to ? (new Date(req.query.to)) : null, // todo: probably should be the end of the day
        limit: req.query.limit ? Number(req.query.limit) : null,
        userId: new ObjectId(req.params.userId)
      })
      res.status(result.status).json(result.errors || result.data)
    } else {
      res.status(400).json('invalid userId')
    }
  }
);

function handleValidation (req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }
}

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
