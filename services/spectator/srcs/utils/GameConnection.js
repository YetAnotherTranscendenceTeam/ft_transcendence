"use strict";

import YATT from "yatt-utils";
import { WsCloseError } from "yatt-ws";

export class GameConnection {

  constructor(match_id, fastify) {
    this.match_id = match_id;
    this.tokens = fastify.tokens;
    this.subscriptions = new Set();

    this.socket = new WebSocket(`ws://pong:3000/spectate?match_id=${this.match_id}&access_token=${this.tokens.get("spectator")}`);

    fastify.games.set(match_id, this);

    this.socket.addEventListener("message", (message) => {
      this.#broadcast(message.data);
    });

    this.socket.addEventListener("open", () => {
      console.log(`SPECTATING ${match_id}`);
    });

    this.socket.addEventListener("error", (err) => {
      console.log(`Failed Spectating game ${match_id}:`, err);
    });

    this.socket.addEventListener("close", () => {
      console.log(`LEAVING ${match_id}`);
      this.subscriptions.forEach(client => { client.socket.close() });
      fastify.games.delete(match_id);
    });
  };

  async subscribe(socket) {
  
    try {
      const sync = await YATT.fetch(`http://pong:3000/spectate/sync?match_id=${this.match_id}&access_token=${this.tokens.get("spectator")}`)
      socket.send(JSON.stringify(sync));
    } catch (err) {
      WsCloseError.BadGateway.send(socket);
      return;
    }
    
    socket.on("close", () => {
      this.subscriptions.delete(socket);
      this.#broadcastJSON({ event: "spectator_count", data: { count: this.subscriptions.size } });
      console.log(`LEFT ${this.match_id}[${this.subscriptions.size}] `);
    });
    
    this.subscriptions.add(socket);
    this.#broadcastJSON({ event: "spectator_count", data: { count: this.subscriptions.size } });
    console.log(`JOIN ${this.match_id}[${this.subscriptions.size}]`);
  };

  #broadcastJSON(payload) {
    this.#broadcast(JSON.stringify(payload));
  };

  #broadcast(payload) {
    this.subscriptions.forEach(socket => { socket.send(payload) });
  };

};
