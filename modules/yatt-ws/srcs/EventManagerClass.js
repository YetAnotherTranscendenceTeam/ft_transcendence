import Ajv from "ajv"
import WsError from "./WsError.js";

export default class EventManagerClass {
  ajv = new Ajv();
  events = new Map();
  eventSchema = {
    type: "object",
    properties: {
      event: { type: "string" },
      data: { type: "object" }
    },
    required: ["event"],
    additionalProperties: false,
  }

  register(eventId, config) {
    this.events.set(eventId, config);
  }

  receive(socket, payload, options = {}) {
    // Validate payload format
    if (!this.ajv.validate(this.eventSchema, payload)) {
      return new WsError.InvalidMessage(payload).send(socket);
    }

    // Search matching registered event
    const event = this.events.get(payload.event);
    if (!event) {
      return new WsError.UnknownEvent({ event: payload.event }).send(socket);
    }

    // Validate event data
    if (event.schema && !this.ajv.validate(event.schema, payload.data)) {
      return new WsError.InvalidEvent(payload).send(socket);
    }

    // Execute event function
    try {
      event.handler(socket, payload, options);
    } catch (err) {
      if (err instanceof WsError) {
        err.send(socket);
      } else {
        throw err;
      }
    }
  }
}