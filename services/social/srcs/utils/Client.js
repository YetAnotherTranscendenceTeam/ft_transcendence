import db from "../app/database.js";
import { userInfos } from "./userInfos.js";

export class Client {
  account_id;
  sockets = new Set();
  status = "online";
  disconnectTimeout = null;

  constructor(socket, account_id) {
    this.account_id = account_id;
    this.sockets.add(socket);
    console.log("NEW CLIENT:", { account_id: this.account_id, sockets: this.sockets.size });
  }
  
  addSocket(socket) {
    this.sockets.add(socket);
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
}
