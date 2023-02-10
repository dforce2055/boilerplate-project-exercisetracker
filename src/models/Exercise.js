let mongoose = require('mongoose')

let exerciseSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

module.exports = mongoose.model('Exercise', exerciseSchema)