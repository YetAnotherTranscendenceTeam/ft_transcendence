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

  register(eventId, configuration) {
    this.events.set(eventId, configuration);
  }

  receive(socket, payload) {
    // Validate the payload

    if (!this.ajv.validate(this.eventSchema, payload)) {
      return new WsError.InvalidMessage(payload).send(socket);
    }

    // Get the matching event
    const event = this.events.get(payload.event);
    if (!event) {
      return new WsError.UnknownEvent({ event: payload.event }).send(socket);
    }

    // Validate the event data
    if (event.schema && !this.ajv.validate(event.schema, payload.data)) {
      return new WsError.InvalidEvent(payload).send(socket);
    }

    // Execute the event function
    event.handler(socket);
  }
}
