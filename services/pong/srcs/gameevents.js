import { EventManager } from "yatt-ws";

export const gameEvents = new EventManager();

gameEvents.register("increment", {handler: (socket, payload, game) => {
	console.log(game)
	game.incrementCounter();
}})

gameEvents.register("decrement", {handler: (socket, payload, game) => {
	game.decrementCounter();
}})