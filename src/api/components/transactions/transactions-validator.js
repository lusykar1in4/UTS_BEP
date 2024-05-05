const joi = require('joi');

module.exports = {
  createTransaction: {
    body: {
      userSender: joi.string().min(1).max(100).required().label('User Sender'),
      userReceiver: joi
        .string()
        .min(1)
        .max(100)
        .required()
        .label('User Receiver'),
      nominal: joi.number().required().label('Nominal'),
      description: joi.string().min(1).max(100).required().label('Description'),
    },
  },

  updateTransaction: {
    body: {
      userSender: joi.string().min(1).max(100).required().label('User Sender'),
      userReceiver: joi
        .string()
        .min(1)
        .max(100)
        .required()
        .label('User Receiver'),
      nominal: joi.number().required().label('Nominal'),
      description: joi.string().min(1).max(100).required().label('Description'),
    },
  },
};
