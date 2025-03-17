export default class HttpError {
  constructor(
    statusCode,
    error,
    message = null,
    code = `HTTP_ERROR_${statusCode}`
  ) {
    this.statusCode = statusCode;
    this.code = code;
    this.error = error;
    this.message = message;
  }

  json() {
    return {
      statusCode: this.statusCode,
      code: this.code,
      error: this.error,
      message: this.message,
    };
  }

  send(reply) {
    reply.code(this.statusCode).send(this.json());
  }

  redirect(reply, url) {
    reply.redirect(`${url}?${new URLSearchParams(this.json()).toString()}`)
  }

  // Preset specific http
  static BadRequest = class BadRequest extends HttpError {
    constructor(message = httpErrMessages.get(400)) {
      super(400, "Bad Request", message);
    }
  };

  static Unauthorized = class Unauthorized extends HttpError {
    constructor(message = httpErrMessages.get(401)) {
      super(401, "Unauthorized", message);
    }
  };

  static Forbidden = class Forbidden extends HttpError {
    constructor(message = httpErrMessages.get(403)) {
      super(403, "Forbidden", message);
    }
  };

  static NotFound = class NotFound extends HttpError {
    constructor(message = httpErrMessages.get(404)) {
      super(404, "Not Found", message);
    }
  };

  static NotAcceptable = class NotAcceptable extends HttpError { // Added here
    constructor(message = httpErrMessages.get(406)) {
      super(406, "Not Acceptable", message);
    }
  };

  static Conflict = class Conflict extends HttpError {
    constructor(message = httpErrMessages.get(409)) {
      super(409, "Conflict", message);
    }
  };

  static TooManyRequests = class TooManyRequests extends HttpError {
    constructor(message = httpErrMessages.get(429)) {
      super(429, "Too Many Requests", message);
    }
  };

  static InternalServerError = class InternalServerError extends HttpError {
    constructor(message = httpErrMessages.get(500)) {
      super(500, "Internal Server Error", message);
    }
  };

  static NotImplemented = class NotImplemented extends HttpError {
    constructor(message = httpErrMessages.get(501)) {
      super(501, "Not Implemented", message);
    }
  };

  static BadGateway = class BadGateway extends HttpError {
    constructor(message = httpErrMessages.get(502)) {
      super(502, "Bad Gateway", message);
    }
  };

  static ServiceUnavailable = class ServiceUnavailable extends HttpError {
    constructor(message = httpErrMessages.get(503)) {
      super(503, "Service Unavailable", message);
    }
  };
}

export const httpErrMessages = new Map();
httpErrMessages.set(400, "The server cannot process the request due to a client error");
httpErrMessages.set(401, "Authentication is required and has failed or has not been provided");
httpErrMessages.set(403, "The server understood the request but refuses to authorize it");
httpErrMessages.set(404, "The requested resource could not be found on the server");
httpErrMessages.set(406, "The server cannot produce a response matching the list of acceptable values defined in the request");
httpErrMessages.set(409, "The request could not be completed due to a conflict with the current state of the target resource");
httpErrMessages.set(429, "You're doing that too often! Try again later.");
httpErrMessages.set(500, "An unexpected error occurred on the server");
httpErrMessages.set(501, "The server does not support the functionality required to fulfill the request");
httpErrMessages.set(502, "The server received an invalid response from an upstream server");
httpErrMessages.set(503, "The server cannot handle the request right now");
