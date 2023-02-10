let mongoose = require('mongoose')

let userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  exercises: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise'
  }]
})

module.exports = mongoose.model('User', userSchema)