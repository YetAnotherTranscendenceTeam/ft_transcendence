import Ajv from "ajv"
import WsError from "./WsError.js";

/**
 * @import {Schema, JSONSchemaType, ValidateFunction} from "ajv"
 * @import {WebSocket as ws} from "ws"
 * @typedef {Schema | JSONSchemaType<any> | undefined} AJVSchema
 * @typedef {(socket: ws, payload: any) => Promise<void>} EventHandler
 */

export default class EventManagerClass {
  ajv = new Ajv();
  validate = this.ajv.compile({
    type: "object",
    properties: {
      event: { type: "string" },
      data: { type: "object" }
    },
    required: ["event"],
    additionalProperties: false,
  });
  /**
   * @type {Map<string, {
   *  schema: AJVSchema,
   *  handler: EventHandler,
   *  validate: ValidateFunction | undefined
   * }>}
   */
  events = new Map();
  
  /**
   * 
   * @param {string} eventId 
   * @param {{schema: AJVSchema, handler: EventHandler} config 
   */
  register(eventId, config) {
    if (config.schema) {
      config.validate = this.ajv.compile(config.schema);
    }
    this.events.set(eventId, config);
  }

  async receive(socket, payload, ...params) {
    // Validate payload format
    if (!this.validate(payload)) {
      return new WsError.InvalidMessage({...payload, ajv: this.validate.errors}).send(socket);
    }

    // Search matching registered event
    const event = this.events.get(payload.event);
    if (!event) {
      return new WsError.UnknownEvent({ event: payload.event }).send(socket);
    }

    // Validate event data
    if (event.validate && !event.validate(payload.data)) {
      return new WsError.InvalidEvent({...payload, ajv: event.validate.errors}).send(socket);
    }

    // Execute event function
    try {
      await event.handler(socket, payload, ...params);
    } catch (err) {
      if (err instanceof WsError) {
        err.send(socket);
      } else {
        throw err;
      }
    }
  }
}
