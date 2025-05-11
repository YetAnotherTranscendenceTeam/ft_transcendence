"use strict";

class Subscrption {

  constructor(socket) {
    this.socket = socket;
    this.isSynced = false;
  };

  sync(payload) {
    if (this.isSynced) {
      return;
    }
    this.socket.send(payload);
    this.isSynced = true;
  };

  send(payload) {
    if (!this.isSynced) {
      return;
    }
    this.socket.send(payload);
  };
};

export class GameConnection {

  constructor(match_id, fastify) {
    this.match_id = match_id;
    this.subscriptions = new Set();
    this.socket = new WebSocket(`ws://pong:3000/spectate?match_id=${match_id}&access_token=${fastify.jwt.pong.sign({})}`);

    fastify.games.set(match_id, this);

    this.socket.addEventListener("message", (message) => {
      this.#broadcast(message.data);
    });

    this.socket.addEventListener("open", () => {
      console.log(`Spectating game ${match_id}`);
      this.isOpen = true;
      this.socket.send(JSON.stringify({ event: "sync" }));
    });

    this.socket.addEventListener("error", (err) => {
      console.log(`Failed Spectating game ${match_id}:`, err);
    });

    this.socket.addEventListener("close", () => {
      console.log(`Leaving game ${match_id}`);
      this.subscriptions.forEach(client => { client.socket.close() });
      fastify.games.delete(match_id);
    });

  };

  subscribe(socket) {
    const client = new Subscrption(socket);

    this.subscriptions.add(client);
    console.log(`Client joined ${this.match_id} spectator [${this.subscriptions.size}]`);

    client.socket.on("close", () => {
      this.subscriptions.delete(client);
      console.log(`Client left ${this.match_id} spectator [${this.subscriptions.size}]`);
    });

    if (this.isOpen) {
      this.socket.send(JSON.stringify({ event: "sync" }));
    }
  };

  #broadcast(payload) {
    const parsed = JSON.parse(payload);

    this.subscriptions.forEach(client => {
      if (parsed.event === "sync") {
        client.sync(payload);
      } else {
        client.send(payload);
      }
    });
  };

};
