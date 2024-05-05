const mongoose = require('mongoose');

const transactionsSchema = {
  userSender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  userReceiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  nominal: Number,
  description: String,
  date: Date,
};

module.exports = transactionsSchema;
