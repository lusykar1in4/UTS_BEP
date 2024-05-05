const { max, last } = require('lodash');
const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */

const failedLogin = {};
const lastLogin = {};
const resetMinutes = 30;
const maxLogin = 5;

async function login(request, response, next) {
  const { email, password } = request.body;

  try {
    if (failedLogin[email] >= maxLogin) {
      if (
        lastLogin[email] &&
        Date.now() - lastLogin[email] < resetMinutes * 60 * 1000
      ) {
        throw errorResponder(
          errorTypes.TOO_MANY_FAILED_LOGIN_ATTEMPTS,
          'Too many failed login attempts. Please try again after 30 minutes.'
        );
      } else {
        delete failedLogin[email];
      }
    }

    // Check login credentials
    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email,
      password
    );

    if (!loginSuccess) {
      failedLogin[email] = (failedLogin[email] || 0) + 1;
      lastLogin[email] = Date.now();

      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        'Wrong email or password'
      );
    }

    delete failedLogin[email];
    delete lastLogin[email];
    return response.status(200).json(loginSuccess);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
