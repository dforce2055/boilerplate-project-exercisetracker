let mongoose = require('mongoose')

let logSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  count: {
    type: Number,
    required: true
  },
  log: [{
    description: String,
    duration: Number,
    date: String
  }]
})

module.exports = mongoose.model('Log', logSchema)