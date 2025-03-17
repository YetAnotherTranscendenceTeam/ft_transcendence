import db from "../app/database.js";
import { offline_delay } from "../app/env.js";
import { Client } from "./Client.js";

export class ConnectionManager {
  map = new Map();

  constructor() {
    this.interval = setInterval(() => { this.ping(); }, 30000);
  }

  connect(socket, account_id) {
    let client = this.map.get(account_id);
    if (client) {
      if (client.sockets.size >= 5) {
        throw new Error(`Connection limit exceeded for account ${account_id}`)
      }
      client.addSocket(socket);   
      clearTimeout(client.disconnectTimeout);
      if (client.status === "inactive") {
        client.status = "online";
      }
    } else {
      client = new Client(socket, account_id, this);
      this.map.set(account_id, client);
    }
    
    return client;
  }

  disconnect(client, socket, clients) {
    const { account_id } = client;

    if (!client.deleteSocket(socket)) {
      if (client.inactiveTimeout) {
        clearTimeout(client.inactiveTimeout);
      }
      client.disconnectTimeout = setTimeout(() => {
        client.status = "offline"
        clients.broadcastStatus(client);
        this.map.delete(account_id);
      }, offline_delay);
      console.log("GOING OFFLINE:", { account_id, in: offline_delay });
    }
  }

  #getFollowers = db.prepare(`SELECT account_id FROM follows WHERE following = ?`);

  broadcastStatus(target) {
    console.log("STATUS CHANGE:", { account_id: target.account_id, status: target.status });
    const followers = this.#getFollowers.all(target.account_id);
    followers.forEach(follower => {
      this.map.get(follower.account_id)?.statusUpdate(target.account_id, target.status);
    });
  }

  get(account_id) {
    const data = this.map.get(account_id);
    return data;
  }

  cleanup() {
    this.map.forEach(client => {
      client.sockets.forEach(socket => {
        socket.close(1001, "Going Away")
      });
    });
  }

  ping() {
    this.map.forEach(client => {
      client.ping();
    });
  }
}
