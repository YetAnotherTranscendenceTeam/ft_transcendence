import { EventManager } from "yatt-ws";
import { K, PlayerMovement, Pong } from "pong"

export const gameEvents = new EventManager();

const data_schema = {
	type: "object",
	required: ["tick", "movement"],
	properties: {
		tick: {
			type: "number",
			minimum: 0,
		},
		movement: {
			type: "number",
			enum: [PlayerMovement.DOWN, PlayerMovement.UP, PlayerMovement.NONE],
		}
	},
    additionalProperties: false,
}

gameEvents.register("movement", {
	schema: data_schema,
	handler: (socket, payload, game, player) => {
		game.paddles.get(player.paddleId).velocity.y = payload.data.movement * K.paddleSpeed;
		player.movement = payload.data.movement;
	}
})

