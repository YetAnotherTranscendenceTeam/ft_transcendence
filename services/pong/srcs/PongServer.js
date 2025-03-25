import { Pong } from "pong";

export class PongServer extends Pong {

	clients = new Set();
	
	decrementCounter() {
		super.decrementCounter();
		this.broadcastState();
	}

	incrementCounter() {
		super.incrementCounter();
		this.broadcastState();
	}
	
	broadcastState() {
		const msg = JSON.stringify({event: 'state', data: {counter: this.counter}});
		for (const client of this.clients) {
			client.send(msg);
		}
	}

	addClient(client) {
		this.clients.add(client);
	}

	removeClient() {
		this.clients.delete(client);
	}
}