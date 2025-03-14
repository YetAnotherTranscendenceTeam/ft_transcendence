import db from "../app/database.js";
import { Client } from "./Client.js";

export class ConnectionManager {
  map = new Map();

  constructor() {
    this.interval = setInterval(() => { this.ping(); }, 30000);
  }

  connect(socket, account_id) {
    let client = this.map.get(account_id);
    if (client) {
      client.addSocket(socket);   
      clearTimeout(client.disconnectTimeout);
    } else {
      client = new Client(socket, account_id);
      this.map.set(account_id, client);
    }
    return client;
  }

  disconnect(client, socket, clients) {
    const { account_id } = client;

    if (!client.deleteSocket(socket)) {
      client.disconnectTimeout = setTimeout(() => {
        clients.broadcastStatus(client, "offline");
        this.map.delete(account_id);
      }, 10000);
      console.log("GOING OFFLINE:", { account_id, in: 10000 });
    }
  }

  #getFollowers = db.prepare(`SELECT account_id FROM follows WHERE following = ?`);

  broadcastStatus(target, status = target.status) {
    console.log("STATUS CHANGE:", { account_id: target.account_id, status });
    const followers = this.#getFollowers.all(target.account_id);
    followers.forEach(follower => {
      this.map.get(follower.account_id)?.statusUpdate(target.account_id, status);
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
