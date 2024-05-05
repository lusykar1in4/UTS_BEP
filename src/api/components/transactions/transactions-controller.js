const transactionsService = require('./transactions-service');
const usersService = require('./../users//users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Handle get list of transactions request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getTransactions(request, response, next) {
  try {
    const transactions = await transactionsService.getTransactions(
      request.query
    );
    return response.status(200).json(transactions);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get transaction detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getTransaction(request, response, next) {
  try {
    const transaction = await transactionsService.getTransaction(
      request.params.id
    );

    if (!transaction) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Unknown transaction'
      );
    }

    return response.status(200).json(transaction);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create transaction request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createTransaction(request, response, next) {
  try {
    const userSender = request.body.userSender;
    const userReceiver = request.body.userReceiver;
    const nominal = request.body.nominal;
    const description = request.body.description;

    if (userSender == userReceiver) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create transaction, User Sender cannot be the same as User Receiver'
      );
    }

    const user_sender = await usersService.getUser(userSender);

    if (!user_sender) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Unknown User Sender'
      );
    }

    const user_receiver = await usersService.getUser(userReceiver);

    if (!user_receiver) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Unknown User Receiver'
      );
    }

    if (user_sender.balance < nominal) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Your Account does not have enough Balance (' +
          user_sender.balance +
          ')'
      );
    }

    const success = await transactionsService.createTransaction(
      userSender,
      userReceiver,
      nominal,
      description
    );
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create transaction'
      );
    }

    //update user sender balance
    try {
      const newBalance = user_sender.balance - nominal;
      await usersService.updateBalance(userSender, newBalance);
    } catch {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update user sender balance'
      );
    }

    //update user receiver balance
    try {
      const newBalance = user_receiver.balance + nominal;
      await usersService.updateBalance(userReceiver, newBalance);
    } catch {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update user receiver balance'
      );
    }

    return response
      .status(200)
      .json({ userSender, userReceiver, nominal, description });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateTransaction(request, response, next) {
  try {
    const id = request.params.id;
    const userSender = request.body.userSender;
    const userReceiver = request.body.userReceiver;
    const nominal = request.body.nominal;
    const description = request.body.description;

    if (userSender == userReceiver) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create transaction, User Sender cannot be the same as User Receiver'
      );
    }

    const user_sender = await usersService.getUser(userSender);

    if (!user_sender) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Unknown User Sender'
      );
    }

    const user_receiver = await usersService.getUser(userReceiver);

    if (!user_receiver) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Unknown User Receiver'
      );
    }

    var transaction = null;

    try {
      transaction = await transactionsService.getTransaction(request.params.id);

      if (!transaction) {
        throw errorResponder(
          errorTypes.UNPROCESSABLE_ENTITY,
          'Unknown transaction'
        );
      }
    } catch (error) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Unknown transaction'
      );
    }

    var new_nominal = user_sender.nominal;

    if (transaction.nominal != nominal) {
      if (transaction.nominal < nominal) {
        new_nominal = nominal - transaction.nominal;
        if (user_sender.balance < new_nominal) {
          throw errorResponder(
            errorTypes.UNPROCESSABLE_ENTITY,
            'Your Account does not have enough Balance (' +
              user_sender.balance +
              ')'
          );
        } else {
          new_nominal = user_sender.nominal - new_nominal;
        }
      } else {
        new_nominal = user_sender.nominal + new_nominal;
      }
    }

    const success = await transactionsService.updateTransaction(
      id,
      userSender,
      userReceiver,
      nominal,
      description
    );
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update transaction'
      );
    }
    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete transaction request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteTransaction(request, response, next) {
  try {
    const id = request.params.id;

    const success = await transactionsService.deleteTransaction(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete transaction'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
