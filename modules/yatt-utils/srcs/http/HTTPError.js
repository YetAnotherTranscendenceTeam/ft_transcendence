export class HttpError {
  constructor(statusCode, error, message = null, code = `HTTP_ERROR_${this.statusCode}`) {
    this.statusCode = statusCode;
    this.error = error;
    this.message = message;
  }

  json() {
    return {
      statusCode: this.statusCode,
      code: this.code,
      error: this.error,
      message: this.message
    }
  }

  send(reply) {
    reply.code(this.statusCode).send(this.json());
  }
}

export class BadRequestError extends HttpError {
  constructor(message = errorMessages.get(400)) {
    super(400, 'Bad Request', message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = errorMessages.get(401)) {
    super(401, 'Unauthorized', message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = errorMessages.get(403)) {
    super(403, 'Forbidden', message);
  }
}

export class ConflictError extends HttpError {
  constructor(message = errorMessages.get(409)) {
    super(409, 'Conflict', message);
  }
}

export class TooManyRequestsError extends HttpError {
  constructor(message = errorMessages.get(429)) {
    super(429, 'Too Many Requests', message);
  }
}

export class BadGatewayError extends HttpError {
  constructor(message = errorMessages.get(502)) {
    super(502, 'Bad Gateway', message);
  }
}

export class ServiceUnavailableError extends HttpError {
  constructor(message = errorMessages.get(503)) {
    super(503, 'Service Unavailable', message);
  }
}