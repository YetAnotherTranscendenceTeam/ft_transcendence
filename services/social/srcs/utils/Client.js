import db from "../app/database.js";
import { inactivity_delay } from "../app/env.js";
import { userInfos } from "./userInfos.js";

const statuses = ['online', 'offline', 'ingame'];

export class Client {
  account_id;
  sockets = new Set();
  status = "online"

  disconnectTimeout = null;
  inactiveTimeout = null

  allClients;

  constructor(socket, account_id, clients) {
    this.account_id = account_id;
    this.allClients = clients;
    this.sockets.add(socket);
    this.inactiveTimeout = setTimeout(() => {
      this.status = "inactive";
      this.allClients.broadcastStatus(this);
    }, inactivity_delay);
    console.log("NEW CLIENT:", { account_id: this.account_id, sockets: this.sockets.size });
  }

  addSocket(socket) {
    this.sockets.add(socket);
    if (this.inactiveTimeout) {
      clearTimeout(this.inactiveTimeout);
    }
    this.inactiveTimeout = setTimeout(() => {
      this.status = "inactive";
      this.allClients.broadcastStatus(this);
    }, inactivity_delay);
    console.log("CLIENT SOCKET+:", { account_id: this.account_id, sockets: this.sockets.size });
  }

  deleteSocket(socket) {
    this.sockets.delete(socket);
    console.log("CLIENT SOCKET-:", { account_id: this.account_id, sockets: this.sockets.size });
    return this.sockets.size;
  }

  send(payload) {
    const data = JSON.stringify(payload);
    this.sockets.forEach(socket => socket.send(data));
  }

  async welcome(clients, socket) {
    const friends = db.prepare(`
      SELECT following
      FROM follows
      WHERE account_id = ?
      `).all(this.account_id);

    const payload = {
      event: "welcome",
      data: {
        follows: await Promise.all(friends.map(async element => {
          return userInfos(element.following, clients);
        })),
      }
    };
    const data = JSON.stringify(payload);
    socket.send(data);
  }

  async follow(account_id, clients) {
    const payload = {
      event: "follow",
      data: await userInfos(account_id, clients),
    }
    this.send(payload);
  }

  async unfollow(account_id) {
    const payload = {
      event: "unfollow",
      data: { account_id },
    }
    this.send(payload);
  }

  statusUpdate(account_id, status) {
    const payload = {
      event: "status",
      data: { account_id, status },
    }
    console.log("BROADCAST:", { account_id, payload });
    this.send(payload);
  }

  ping() {
    this.sockets.forEach(socket => socket.ping());
  }

  setStatus(status) {
    const oldStatus = this.status;
    const newStatus = statuses.find(s => s === status) ? status : "online"

    // Cancel inactivity timeout
    if (this.inactiveTimeout) {
      clearTimeout(this.inactiveTimeout);
    }
    // Set new activity status
    this.status = newStatus;

    // Set inactivity timeout
    this.inactiveTimeout = setTimeout(() => {
      this.status = "inactive";
      this.allClients.broadcastStatus(this);
    }, inactivity_delay);

    // Broadcast to followers if status changed
    if (oldStatus !== this.status) {
      this.allClients.broadcastStatus(this);
    }
  }
}
