const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * Get list of users
 * @returns {Array}
 */
async function getUsers(query) {
  let page_number = query.page_number ? parseInt(query.page_number) : 1;
  let page_size = query.page_size ? parseInt(query.page_size) : 10;
  let total_pages = 1;
  let has_previous_page = false;
  let has_next_page = false;

  const users = await usersRepository.getUsers({
    page_number,
    page_size,
    sort: query.sort,
    search: query.search,
  });

  const results = [];
  for (let i = 0; i < users.length; i += 1) {
    const user = users[i];
    results.push({
      id: user.id,
      name: user.name,
      email: user.email,
      balance: user.balance,
    });
  }

  const totalCount = await usersRepository.getUsersTotal({
    search: query.search,
  });
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
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    balance: user.balance,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @param {number} balance - Balance
 * @returns {boolean}
 */
async function createUser(name, email, password, balance) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword, balance);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update user balance
 * @param {string} id - User ID
 * @param {number} balance - Balance
 * @returns {boolean}
 */
async function updateBalance(id, balance) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateBalance(id, balance);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);
  return passwordMatched(password, user.password);
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  emailIsRegistered,
  checkPassword,
  changePassword,
  updateBalance,
};
