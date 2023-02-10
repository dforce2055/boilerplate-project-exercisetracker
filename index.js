const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const bodyParser = require("body-parser");
const DB = require('./src/database.js')
const User = require('./src/models/User.js')
const Exercise = require('./src/models/Exercise.js')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: "false" }))
app.use(bodyParser.json())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', async (req, res) => {
  try {
    const { allUsers } = await getAllUsers()

    res.json({
      allUsers
    })
  } catch (error) {
    res.json({
      error: error.message
    })
  }
})

app.post('/api/users', async (req, res) => {
  try {
    const { username } = req.body

    if (!validUsername(username))
      throw new Error('invalid username')

    const { _id } = await createAndSaveUser(username)
    res.json({
      username,
      _id
    })
  } catch (error) {
    res.json({
      error: 'invalid username or duplicated'
    })
  }
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const id = req.body[':_id']
    const { description, duration, date } = req.body

    const exercise = { id, description, duration, date }

    if (!validExercise(exercise))
      throw new Error('invalid Exercise')

    const result = await createAndSaveExercise(exercise)
    res.json({
      result
    });
  } catch (error) {
    res.json({
      error: 'invalid username or duplicated'
    })
  }
})

const validUsername = (username) => {
  try {
    return username ? true : false
  } catch (error) {
    return false
  }
}
const validExercise = ({ id, description, duration, date }) => {
  try {
    return (id && description && duration) ? true : false
  } catch (error) {
    return false
  }
}
const createAndSaveUser = async (username) => {
  try {
    const newUsername = new User({
      username,
    })

    return await newUsername.save()
  } catch (error) {
    throw error
  }
}

const createAndSaveExercise = async ({ id, description, duration, date }) => {
  try {
    const user = await getUserById(id)
    const dateValidated = getValidDate(date)

    const newExercise = new Exercise({
      user,
      username: user.username,
      description,
      duration,
      date: dateValidated
    })

    return await newExercise.save()
  } catch (error) {
    throw error
  }
}

const getAllUsers = async () => {
  const allUsers = await User.find()
  return { allUsers }
}

const getUserByUsername = async (username) => {
  return await User.find({ username })
}
const getUserById = async (id) => {
  return await User.findById(id)
}

const getValidDate = (dateString) => {
  let dateValidated = undefined

  if (isATimeStamp(dateString))
    dateValidated = new Date(parseInt(dateString)).toDateString()
  else
    dateValidated = new Date(dateString).toDateString()

  if (dateValidated == 'Invalid Date' || !dateString)
    dateValidated = new Date().toDateString()

  return dateValidated
}

const isATimeStamp = (dateString) => {
  // valid dateString 
  // '2015-02-01'
  // '05 October 2011, GMT'
  // else is timestamp '1451001600000'
  return Boolean(Date.parse(dateString)) ? false : true
}


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
