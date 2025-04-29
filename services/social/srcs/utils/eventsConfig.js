"use strict";

import { properties } from "yatt-utils";
import { EventManager } from "yatt-ws";

export const events = new EventManager();

events.register("goodbye", {
  handler: (socket, payload, client) => {
    socket.close(1000, "Normal Closure");
  },
});

events.register("ping", {
  handler: (socket, payload, client) => {
    client.resetInactivity();
  },
});

events.register("send_status", {
  schema: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: ["online", "ingame", "inlobby"],
      },
      data: {
        type: "object"
      },
    },
    required: ["type"],
    additionalProperties: false,
  },
  handler: (socket, payload, client) => {
    client.setStatus(payload.data);
  },
});

events.register("send_lobby_invite", {
  schema: {
    type: "object",
    properties: {
      account_id: properties.account_id,
      gamemode: { type: "object" },
      join_secret: { type: "string" },
    },
    required: ["account_id", "gamemode", "join_secret" ],
    additionalProperties: false,
  },
  handler: async (socket, payload, client) => {
    await client.sendLobbyInvite(payload.data);
  },
});

events.register("send_lobby_request", {
  schema: {
    type: "object",
    properties: {
      account_id: properties.account_id,
    },
    required: ["account_id"],
    additionalProperties: false,
  },
  handler: async (socket, payload, client) => {
    await client.sendLobbyJoinRequest(payload.data);
  },
});
