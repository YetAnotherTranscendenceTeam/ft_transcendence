export default class WsError {
  constructor(code, message = null, details) {
    this.code = code;
    this.message = message;
    this.details = details;
  }

  send(socket) {
    socket.send(JSON.stringify({ event: "error", data: this }));
  }

  // Preset errors
  static InvalidMessage = class InvalidMessage extends WsError {
    constructor(details) {
      const message = "The message payload does not meet the required format";
      super("INVALID_MESSAGE", message, details);
    }
  };

  static UnknownEvent = class UnkownEvent extends WsError {
    constructor(details) {
      const message = "An unrecognized event type was received";
      super("UNKNOWN_EVENT", message, details);
    }
  };

  static InvalidEvent = class InvalidEvent extends WsError {
    constructor(details) {
      const message = "The event payload contains invalid or missing data";
      super("INVALID_EVENT", message, details);
    }
  };

  static UserUnavailable = class UserUnavailable extends WsError {
    constructor(details) {
      const message = "The requested user is currently offline or not accessible";
      super("USER_UNAVAILABLE", message, details);
    }
  };

  static BadGateway = class BadGateway extends WsError {
    constructor(details) {
      const message = "The server received an invalid response from an upstream server";
      super("BAD_GATEWAY", message, details);
    }
  };
}
