const transactionsRepository = require('./transactions-repository');

/**
 * Get list of transactions
 * @returns {Array}
 */
async function getTransactions(query, userId, type) {
  let page_number = query.page_number ? parseInt(query.page_number) : 1;
  let page_size = query.page_size ? parseInt(query.page_size) : 10;
  let total_pages = 1;
  let has_previous_page = false;
  let has_next_page = false;

  const transactions = await transactionsRepository.getTransactions(
    {
      page_number,
      page_size,
      sort: query.sort,
      search: query.search,
    },
    userId,
    type
  );

  const results = [];
  for (let i = 0; i < transactions.length; i += 1) {
    const transaction = transactions[i];
    results.push({
      id: transaction.id,
      userSender: transaction.userSender,
      userReceiver: transaction.userReceiver,
      nominal: transaction.nominal,
      description: transaction.description,
      date: transaction.date,
    });
  }

  const totalCount = await transactionsRepository.getTransactionsTotal(
    {
      search: query.search,
    },
    userId,
    type
  );
  total_pages = Math.ceil(totalCount / page_size);

  if (total_pages < 1) total_pages = 1;
  else if (total_pages > 1) {
    if (page_number > 1) {
      has_previous_page = true;
    }

    if (page_number < total_pages) {
      has_next_page = true;
    }
  }

  return {
    page_number,
    page_size,
    count: totalCount,
    total_pages,
    has_previous_page,
    has_next_page,
    data: results,
  };
}

/**
 * Get transaction detail
 * @param {string} id - Transaction ID
 * @returns {Object}
 */
async function getTransaction(id) {
  const transaction = await transactionsRepository.getTransaction(id);

  // Transaction not found
  if (!transaction) {
    return null;
  }

  return {
    id: transaction.id,
    userSender: transaction.userSender,
    userReceiver: transaction.userReceiver,
    nominal: transaction.nominal,
    description: transaction.description,
    date: transaction.date,
  };
}

/**
 * Create new transaction
 * @param {string} userSender - User Sender
 * @param {string} userReceiver - User Receiver
 * @param {number} nominal - Nominal
 * @param {string} description - Description
 * @returns {boolean}
 */
async function createTransaction(
  userSender,
  userReceiver,
  nominal,
  description
) {
  try {
    await transactionsRepository.createTransaction(
      userSender,
      userReceiver,
      nominal,
      description
    );
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing transaction
 * @param {string} id - Transaction ID
 * @param {string} userSender - User Sender
 * @param {string} userReceiver - User Receiver
 * @param {number} nominal - Nominal
 * @param {string} description - Description
 * @returns {boolean}
 */
async function updateTransaction(
  id,
  userSender,
  userReceiver,
  nominal,
  description
) {
  const transaction = await transactionsRepository.getTransaction(id);

  // Transaction not found
  if (!transaction) {
    return null;
  }

  try {
    await transactionsRepository.updateTransaction(
      id,
      userSender,
      userReceiver,
      nominal,
      description
    );
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete transaction
 * @param {string} id - Transaction ID
 * @returns {boolean}
 */
async function deleteTransaction(id) {
  const transaction = await transactionsRepository.getTransaction(id);

  // Transaction not found
  if (!transaction) {
    return null;
  }

  try {
    await transactionsRepository.deleteTransaction(id);
  } catch (err) {
    return null;
  }

  return true;
}

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
