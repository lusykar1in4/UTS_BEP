const moment = require('moment');
const { Transaction } = require('../../../models');

/**
 * Get a list of transactions
 * @returns {Promise}
 */
async function getTransactions(query, userId, type) {
  let sort = {};
  if (query.sort) {
    const [sort_type, sort_order] = query.sort.split(':');
    sort = {
      [sort_type]: sort_order == 'desc' ? -1 : 0,
    };
  }

  let search = {};

  if (userId && type) {
    if (type == 'sender') {
      search = {
        userSender: userId,
      };
    } else if (type == 'receiver') {
      search = {
        userReceiver: userId,
      };
    }
  }
  if (query.search) {
    const [search_type, search_value] = query.search.split(':');

    if (search_value) {
      if (search_type == 'nominal') {
        search = {
          [search_type]: search_value,
        };
      } else if (search_type == 'date') {
        search['date'] = {
          $gte: moment(search_value).startOf('day').format(),
          $lte: moment(search_value).endOf('day').format(),
        };
      } else {
        const regex = new RegExp(search_value, 'i');
        search = {
          [search_type]: {
            $regex: regex,
          },
        };
      }
    }
  }

  const skip = (query.page_number - 1) * query.page_size;

  const transactions = Transaction.find(search)
    .populate('userSender')
    .populate('userReceiver')
    .sort(sort)
    .limit(query.page_size)
    .skip(skip);
  return transactions;
}

/**
 * Get total of transactions
 * @returns {Promise}
 */
async function getTransactionsTotal(query, userId, type) {
  let search = {};
  if (userId && type) {
    if (type == 'sender') {
      search = {
        userSender: userId,
      };
    } else if (type == 'receiver') {
      search = {
        userReceiver: userId,
      };
    }
  }
  if (query.search) {
    const [search_type, search_value] = query.search.split(':');

    if (search_value) {
      if (search_type == 'nominal') {
        search = {
          [search_type]: search_value,
        };
      } else if (search_type == 'date') {
        search['date'] = {
          $gte: moment(search_value).startOf('day').format(),
          $lte: moment(search_value).endOf('day').format(),
        };
      } else {
        const regex = new RegExp(search_value, 'i');
        search = {
          [search_type]: {
            $regex: regex,
          },
        };
      }
    }
  }
  const numTransactions = Transaction.countDocuments(search);
  return numTransactions;
}

/**
 * Get transaction detail
 * @param {string} id - Transaction ID
 * @returns {Promise}
 */
async function getTransaction(id) {
  return Transaction.findById(id)
    .populate('userSender')
    .populate('userReceiver');
}

/**
 * Create new transaction
 * @param {string} userSender - User Sender
 * @param {string} userReceiver - User receiver
 * @param {number} nominal - Nominal
 * @param {string} description - Description
 * @returns {Promise}
 */
async function createTransaction(
  userSender,
  userReceiver,
  nominal,
  description
) {
  return Transaction.create({
    userSender,
    userReceiver,
    nominal,
    description,
    date: new Date(),
  });
}

/**
 * Update existing transaction
 * @param {string} id - Transaction ID
 * @param {string} userSender - User Sender
 * @param {string} userReceiver - User receiver
 * @param {number} nominal - Nominal
 * @param {string} description - Description
 * @returns {Promise}
 */
async function updateTransaction(
  id,
  userSender,
  userReceiver,
  nominal,
  description
) {
  return Transaction.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        userSender,
        userReceiver,
        nominal,
        description,
      },
    }
  );
}

/**
 * Delete a transaction
 * @param {string} id - Transaction ID
 * @returns {Promise}
 */
async function deleteTransaction(id) {
  return Transaction.deleteOne({ _id: id });
}

module.exports = {
  getTransactions,
  getTransactionsTotal,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
