"user strict";

const responseBodyProperties = {
  statusCode: {
    type: "integer",
    minimum: 100,
    maximum: 599,
    description: "The HTTP status code of the response",
  },
  code: {
    type: "string",
    minLength: 1,
    description: "A unique code identifying the type of error or response",
  },
  error: {
    type: "string",
    minLength: 1,
    description: "A brief description of the error or response type",
  },
  message: {
    type: "string",
    minLength: 1,
    description: "A more detailed message explaining the error or response",
  },
};

export default responseBodyProperties;
