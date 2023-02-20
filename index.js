const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const bodyParser = require("body-parser")
const DB = require('./src/database.js')
const User = require('./src/models/User.js')
const Exercise = require('./src/models/Exercise.js')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: "false" }))
app.use(bodyParser.json())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})


app.get('/api/users', async (req, res) => {
  try {
    const { allUsers } = await getAllUsers()

    res.json(allUsers)
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

app.post('/api/users/:id/exercises', async (req, res) => {
  try {
    const id = req.body[':_id'] || req.params.id
    const { description, duration, date } = req.body

    const exercise = { id, description, duration, date }

    if (!validExercise(exercise))
      throw new Error('invalid Exercise')

    const newExercise = await createAndSaveExercise(exercise)

    res.json({
      _id: id, // userId no ExerciseId => newExercise._id,
      username: newExercise.username,
      date: getFormatedDate(newExercise.date),
      duration: newExercise.duration,
      description: newExercise.description,
    })
  } catch (error) {
    res.json({
      error: 'invalid Exercise'
    })
  }
})

app.get('/api/users/:id/logs', async (req, res) => {
  try {
    const { from, to, limit } = req.query
    const { id } = req.params

    const user = await getUserById(id)

    if (!user)
      throw new Error('invalid user')
    
    const logs = await getLogs({ user, from, to, limit })

    res.json(logs)
  } catch (error) {
    res.json({
      error: error.message
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
    const validatedDate = getValidDate(date)

    const newExercise = new Exercise({
      user,
      username: user.username,
      description,
      duration,
      date: validatedDate
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
const getFormatedDate = (dateISOString) => {
  if (!dateISOString || dateISOString.length < 10)
    return new Date().toDateString()
  
  const dateString = dateISOString.toISOString().slice(0, 10)
  const dateFormated = new Date(dateString + ' ') // this space is about crazy things in Date constructor
  return dateFormated.toDateString() || new Date().toDateString()
}
const getValidDate = (dateString) => {
  let validatedDate = undefined

  if (isATimeStamp(dateString))
    validatedDate = new Date(parseInt(dateString))
  else
    validatedDate = new Date(dateString)

  if (validatedDate == 'Invalid Date' || !dateString)
    validatedDate = new Date()

  return validatedDate
}
const isATimeStamp = (dateString) => {
  // valid dateString 
  // '2015-02-01'
  // '05 October 2011, GMT'
  // else is timestamp '1451001600000'
  return Boolean(Date.parse(dateString)) ? false : true
}
const getLogs = async ({ user, from, to, limit }) => {
  let toValidated = undefined
  let fromValidated = undefined
  const dateFilter = {}

  if (to) {
    toValidated = getValidDate(to)
    dateFilter.$lte = toValidated
  }
  if (from) {
    fromValidated = getValidDate(from)
    dateFilter.$gte = fromValidated
  }

  const filter = {
    user,
  }

  if (dateFilter.$lte || dateFilter.$gte)
    filter.date = dateFilter

  const logs = await Exercise.find(filter).limit(parseInt(limit || 100))

  const logsFormated = logs.map(log => {
    return {
      description: log.description,
      duration: log.duration,
      date: getFormatedDate(log.date)
    }
  })
  
  return {
    username: user.username,
    count: logs.length,
    _id: user._id,
    log: logsFormated
  }
}

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
