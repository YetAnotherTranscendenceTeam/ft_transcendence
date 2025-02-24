"use-strict";

const tokenProperties = {
  access_token: {
    type: "string",
    description: "A JSON Web Token"
  },

  expire_at: {
    type: "string",
    format: "date-time",
    description: "The precise date and time when the access token will expire and no longer be valid",
  },
};

export default tokenProperties;
