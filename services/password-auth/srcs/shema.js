'use strict';

const emailSchema = {
    type: "string",
    format: "email",
    description: "The user's email address"
  };
  
  const passwordSchema = {
    type: "string",
    minLength: 8,
    maxLength: 24,
    description: "The user's password, must be between 8 and 24 characters"
  };
  
  // POST /password body validation 
  const schema = {
    body: {
      type: "object",
      properties: {
        email: emailSchema,
        password: passwordSchema
      },
      required: ["email", "password"],
    }
  };
  
  export default schema;
