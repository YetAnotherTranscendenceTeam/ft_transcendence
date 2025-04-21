'use-strict';

const credentialsProperties = {
  account_id: {
    type: "integer",
    minimum: 1,
    description: "The account unique id",
  },

  auth_method: {
    type: "string",
    enum: ['password-auth', 'google-auth', 'fortytwo-auth'],
    description: "The account authentification method",
  },

  email: {
    type: "string",
    format: "email",
    description: "The account email address",
  },

  password: {
    type: "string",
    minLength: 8,
    maxLength: 24,
    description: "The account password, must be between 8 and 24 characters",
  },

  hash: {
    type: "string",
    minLength: 128,
    maxLength: 128,
    description: "The account hashed password",
  },

  salt: {
    type: "string",
    minLength: 64,
    maxLength: 64,
    description: "The hashed password salt",
  },

  intra_user_id: {
    type: "integer",
    minimum: 1,
    description: "The 42Intra user_id associated with the account",
  },

  google_id: {
    type: "integer",
    minimum: 1,
    description: "The google id associated with the account",
  },

  otp_method: {
    type: "string",
    enum: ["none", "app"],
    description: "A two-factor authentification method"
  },

  otp: {
    type: "string",
    minLength: 6,
    maxLength: 6,
    description: "A unique code generated via two-factor authentication",
    pattern: "^[0-9]{6}$",
  }
};

export default credentialsProperties;