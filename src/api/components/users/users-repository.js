const { User } = require('../../../models');

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers(query) {
  let sort = {};
  if (query.sort) {
    const [sort_type, sort_order] = query.sort.split(':');
    sort = {
      [sort_type]: sort_order == 'desc' ? -1 : 0,
    };
  }

  let search = {};
  if (query.search) {
    const [search_type, search_value] = query.search.split(':');

    if (search_value) {
      if (search_type == 'balance') {
        search = {
          [search_type]: search_value,
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

  const users = User.find(search).sort(sort).limit(query.page_size).skip(skip);
  return users;
}

/**
 * Get total of users
 * @returns {Promise}
 */
async function getUsersTotal(query) {
  let search = {};
  if (query.search) {
    const [search_type, search_value] = query.search.split(':');

    if (search_value) {
      if (search_type == 'balance') {
        search = {
          [search_type]: search_value,
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
  const numUsers = User.countDocuments(search);
  return numUsers;
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @param {number} balance - Balance
 * @returns {Promise}
 */
async function createUser(name, email, password, balance) {
  return User.create({
    name,
    email,
    password,
    balance,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Update user balance
 * @param {string} id - User ID
 * @param {number} balance - Balance
 * @returns {Promise}
 */
async function updateBalance(id, balance) {
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        balance,
      },
    }
  );
}

/**
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

/**
 * Get user by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return User.updateOne({ _id: id }, { $set: { password } });
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  changePassword,
  updateBalance,
  getUsersTotal,
};
