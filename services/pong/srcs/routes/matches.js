import { GameModeType, matchParametersSchema } from "yatt-lobbies";
import { GameManager } from "../GameManager.js";
import { HttpError } from "yatt-utils";

export default function router(fastify, opts, done) {
  let schema = {
    body: {
      type: "object",
      required: ["match_id", "gamemode", "teams"],
      additionalProperties: false,
      properties: {
        match_id: { type: "number" },
        gamemode: {
          type: "object",
          required: ["name", "type", "team_size"],
          properties: {
            name: { type: "string" },
            type: { type: "string", enum: Object.values(GameModeType) },
            team_size: { type: "number" }
          }
        },
        teams: {
          type: "array",
          minItems: 2,
          maxItems: 2,
          items: {
            type: "object",
            required: ["players"],
            properties: {
              players: {
                minItems: 1,
                type: "array",
                items: {
                  type: "object",
                  required: ["account_id"],
                  properties: {
                    account_id: { type: "number" },
                    profile: {
                      type: "object",
                      required: ["account_id", "username", "avatar", "created_at", "updated_at"],
                      properties: {
                        account_id: { type: "number" },
                        username: { type: "string" },
                        avatar: { type: "string" },
                        created_at: { type: "string" },
                        updated_at: { type: "string"
                      }
                    }
                  }
                }
              }
              },
              name: { type: "string" },
            }
          }
        },
        match_parameters: matchParametersSchema
      }
    }
  };

  fastify.post("/", {schema}, async (req, res) => {
    try {
      const jwt = req.headers.authorization.replace("Bearer ", "");
      fastify.jwt.pong.verify(jwt);
    }
    catch(e) {
      new HttpError.Unauthorized().send(res);
      return;
    }
    const { match_id, gamemode, teams, match_parameters } = req.body;
    let game;
    try {
      game = fastify.games.registerGame(match_id, gamemode, teams, match_parameters);
    }
    catch(e) {
      res.status(400).send({ error: e.message });
      console.error(e);
      return;
    }
    res.status(201).send(game);
  });

  fastify.delete("/:match_id", {
    schema: {
      params: {
        type: "object",
        required: ["match_id"],
        properties: {
          match_id: { type: "number" }
        }
      }
    }
  }, async (req, res) => {
    try {
      const jwt = req.headers.authorization.replace("Bearer ", "");
      fastify.jwt.pong.verify(jwt);
    }
    catch(e) {
      new HttpError.Unauthorized().send(res);
      return;
    }
    const { match_id } = req.params;
    const game = fastify.games.getGame(match_id);
    if (!game) {
      new HttpError.NotFound().send(res);
      return;
    }
    game.destroy();
  });

  done();
}
