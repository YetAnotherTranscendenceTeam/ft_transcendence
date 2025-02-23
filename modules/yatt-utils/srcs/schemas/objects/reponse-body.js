"user strict";

import tokenProperties from "../properties/jwt.js";
import responseBodyProperties from "../properties/reponse-body.js";

const reponseBodyObjects = {
  errorBody: {
    statusCode: responseBodyProperties.statusCode,
    code: responseBodyProperties.code,
    error: responseBodyProperties.error,
    message: responseBodyProperties.message,
  },
  auth_token: {
    access_token: tokenProperties.access_token,
    expire_at: tokenProperties.expire_at
  },
  accountNotFound: {
    statusCode: 404,
    code: "ACCOUNT_NOT_FOUND",
    error: "Account Not Found",
    message: "The requested account does not exist",
  },
  emailInUse: {
    statusCode: 409,
    code: "AUTH_EMAIL_IN_USE",
    error: "Email Already In Use",
    message: `This email is already associated with an account`,
  }
};

export default reponseBodyObjects;
