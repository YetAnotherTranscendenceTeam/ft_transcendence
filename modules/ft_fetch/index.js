export default async function ft_fetch(url, options) {
  try {
    const response = await fetch(url, options);
    if (response.ok) {
      return await response.json();
    } else {
      const message = errorMessages.get(response.status);
      throw new HttpError(response.status, response.statusText, message);
    }
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new BadGatewayError();
  }
}

export class HttpError {
  constructor(statusCode, error, message = null, code = `HTTP_ERROR_${statusCode})`) {
    this.statusCode = statusCode;
    this.code = code
    this.error = error;
    this.message = message;
  }

  json() {
    return {
      statusCode: this.statusCode,
      code: `HTTP_ERROR_${this.statusCode}`,
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

const errorMessages = new Map();
errorMessages.set(400, "The server cannot process the request due to a client error");
errorMessages.set(401, "Authentication is required and has failed or has not been provided");
errorMessages.set(403, "The server understood the request but refuses to authorize it");
errorMessages.set(409, "The request could not be completed due to a conflict with the current state of the target resource");
errorMessages.set(429, "You're doing that too often! Try again later.")
errorMessages.set(502, "The server received an invalid response from an upstream server");
errorMessages.set(503, "The server cannot handle the request right now");
