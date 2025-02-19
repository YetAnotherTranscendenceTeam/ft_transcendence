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
  }
};

export default reponseBodyObjects;
