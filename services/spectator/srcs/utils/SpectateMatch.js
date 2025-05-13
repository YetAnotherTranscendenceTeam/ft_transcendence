"use strict";

import YATT from "yatt-utils";
import { WsCloseError } from "yatt-ws";

export class SpectateMatch {

  constructor(match_id, fastify) {
    this.match_id = match_id;
    this.fastify = fastify;
    this.subscriptions = new Set();
  };

  async connect() {
    return new Promise((resolve, reject) => {

      const url = new URL("ws://pong:3000/spectate");
      url.searchParams.append("match_id", this.match_id);
      url.searchParams.append("access_token", this.fastify.tokens.get("spectator"));

      this.socket = new WebSocket(url);

      this.socket.addEventListener("message", (message) => {
        this.#broadcast(message.data);
      });

      this.socket.addEventListener("open", () => {
        console.log(`SPECTATING ${this.match_id}`);
        this.fastify.games.set(this.match_id, this);
        resolve();
      });

      this.socket.addEventListener("error", (err) => {
        reject(err);
      });

      this.socket.addEventListener("close", (event) => {
        console.log(`LEAVING ${this.match_id}`);

        const { code, reason } = event.reason === "ENDED" ? event : { code: 4500, reason: "CONNECTION_LOST" }

        this.subscriptions.forEach(subscription => { subscription.close(code, reason); });
        this.fastify.games.delete(this.match_id);
      });
    });
  };

  async subscribe(socket) {
    if (this.socket.readyState !== this.socket.OPEN)
        throw "";

    try {
      const url = new URL("http://pong:3000/spectate/sync")
      url.searchParams.append("match_id", this.match_id)
      url.searchParams.append("access_token", this.fastify.tokens.get("spectator"))

      const sync = await YATT.fetch(url);
      socket.send(JSON.stringify(sync));
    } catch (err) {
      WsCloseError.BadGateway.close(socket);
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
    this.subscriptions.forEach(socket => { socket.send(payload); });
  };

};
