import db from "../app/database.js";
import { offline_delay } from "../app/env.js";
import { Client } from "./Client.js";

export class ConnectionManager {
  map = new Map();

  constructor() {
    this.interval = setInterval(() => { this.pingAllSockets(); }, 30000);
  }

  async connect(socket, account_id) {
    let client = this.map.get(account_id);
    if (client) {
      if (client.sockets.size >= 5) {
        throw new Error(`Connection limit exceeded for account ${account_id}`)
      }
      if (client.offlineTimeout) {
        clearTimeout(client.offlineTimeout);
      }
    } else {
      client = new Client(account_id, this);
      this.map.set(account_id, client);
      this.broadcastStatus(client);
    }
    await client.welcome(this, socket);
    client.addSocket(socket);
    return client;
  }

  disconnect(client, socket) {
    client.deleteSocket(socket)
    if (!client.sockets.size) {
      if (client.inactivityTimeout) {
        clearTimeout(client.inactivityTimeout);
      }
      client.offlineTimeout = setTimeout(() => {
        this.map.delete(client.account_id);
        client.goOffline();
      }, offline_delay);
      console.log("GOING OFFLINE:", { account_id: this.account_id, in: offline_delay });
    }
  }

  #getFollowers = db.prepare(`SELECT account_id FROM follows WHERE following = ?`);

  broadcastStatus(client, status = client.status(), self = true) {
    // Prepare broadcast payload
    const payload = {
      event: "status",
      data: { account_id: client.account_id, status }
    }
    console.log("BROADCASTING:", { account_id: client.account_id, payload: JSON.stringify(payload) });

    // Get accounts to broadcast to
    const targets = this.#getFollowers.all(client.account_id).map(follower => follower.account_id);
    // Add own account
    if (self) {
      targets.push(client.account_id);
    }

    // Send payload to each target
    targets.forEach(id => {
      this.map.get(id)?.send(payload);
    });

    client.lastBroadcast = payload;
  }

  get(account_id) {
    const data = this.map.get(account_id);
    return data;
  }

  pingAllSockets() {
    this.map.forEach(client => {
      client.sockets.forEach(socket => {
        socket.ping();
      })
    });
  }
}
