const transactionsSchema = {
  user_Id_Sender: String,
  user_Id_Receiver: String,
  nominal: Number,
  description: String,
  date: Date,
};

module.exports = transactionsSchema;
