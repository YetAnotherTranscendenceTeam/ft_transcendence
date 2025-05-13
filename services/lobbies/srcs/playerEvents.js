import { EventManager, WsCloseError } from "yatt-ws";
import { GameModes } from "./GameModes.js";
import { PongEventType } from "yatt-lobbies";

export const events = new EventManager();

function assertLeader(client) {
  if (!client.isLeader())
    throw new Error("Only the lobby owner can send this message type");
}

events.register("mode", {
  schema: {
    type: "object",
    properties: {
      mode: { type: "string" },
    },
    required: ["mode"],
    additionalProperties: false,
  },
  handler: (socket, payload, client) => {
    assertLeader(client);
    client.lobby.setGameMode(GameModes[payload.data.mode]);
  },
});

events.register("kick", {
  schema: {
    type: "object",
    properties: {
      account_id: { type: "number", minimum: 0 },
    },
    required: ["account_id"],
    additionalProperties: false,
  },
  handler: (socket, payload, client) => {
    assertLeader(client);
    const target = client.lobby.players.find((p) => p.account_id == payload.data.account_id);
    if (!target) throw new Error("Player not found");
    target.disconnect(WsCloseError.Kicked)
  },
})

events.register("team_name", {
  schema: {
    type: "object",
    properties: {
      name: { type: "string", maxLength: 20 },
    },
    required: ["name"],
    additionalProperties: false,
  },
  handler: (socket, payload, client) => {
    client.lobby.setTeamName(client, payload.data.name);
  },
});

events.register("queue_start", {
  handler: (socket, payload, client) => {
    assertLeader(client);
    client.lobby.queue();
  },
});

events.register("queue_stop", {
  handler: (socket, payload, client) => {
    assertLeader(client);
    client.lobby.unqueue();
  },
});

events.register("disconnect", {
  handler: (socket, payload, client) => {
    client.disconnect();
  },
});

events.register("swap_players", {
  schema: {
    type: "object",
    properties: {
      account_ids: {
        items: { type: "number", minimum: 0 },
        minItems: 2,
        maxItems: 2,
        type: "array",
      },
    },
    required: ["account_ids"],
    additionalProperties: false,
  },
  handler: (socket, payload, client) => {
    client.lobby.swapPlayers(client, payload.data);
  },
});
events.register("match_parameters", {
  schema: {
    type: "object",
    required: ["obstacles", "events", "ball_speed", "point_to_win"],
    additionalProperties: false,
    properties: {
      obstacles: {
        type: "boolean"
      },
      events: {
        type: "array",
        items: {
          type: "number",
          enum: Object.values(PongEventType)
        }
      },
      ball_speed: { type: "number", minimum: 0 },
      point_to_win: { type: "number", minimum: 1 },
    },
  },
  handler: (socket, payload, client) => {
    assertLeader(client);
    client.lobby.setMatchParameters(payload.data);
  },
})
