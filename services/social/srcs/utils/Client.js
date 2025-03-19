import db from "../app/database.js";
import { inactivity_delay } from "../app/env.js";
import { inactive, offline, online, parseUserStatus } from "./activityStatuses.js";
import { userInfos } from "./userInfos.js";

export class Client {
  account_id;
  sockets = new Set();

  isInactive = false;
  customStatus = null;
  
  disconnectTimeout = null;
  inactivityTimeout = null
  
  allClients;
  lastBroadcast = null;

  constructor(account_id, clients) {
    this.account_id = account_id;
    this.allClients = clients;
    console.log("NEW CLIENT:", { account_id: this.account_id, sockets: this.sockets.size });
  }

  addSocket(socket) {
    this.sockets.add(socket);
    this.resetInactivity();
    console.log("CLIENT SOCKET+:", { account_id: this.account_id, sockets: this.sockets.size });
  }

  deleteSocket(socket) {
    this.sockets.delete(socket);
    console.log("CLIENT SOCKET-:", { account_id: this.account_id, sockets: this.sockets.size });
  }

  send(payload) {
    const data = JSON.stringify(payload);
    this.sockets.forEach((ready, socket) => {
      if (ready)
        socket.send(data)
    });
  }

  async welcome(clients, socket) {
    const friends = db.prepare("SELECT following FROM follows WHERE account_id = ?").all(this.account_id);

    const payload = {
      event: "welcome",
      data: {
        follows: await Promise.all(friends.map(async element => {
          return userInfos(element.following, clients);
        })),
        self: this.status(),
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

  goInactive() {
    this.isInactive = true;
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }
    this.allClients.broadcastStatus(this);
  }

  resetInactivity() {
    // Cancel previous inactivity timeout
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout)
    }

    // Start new inactivity timeout
    this.inactivityTimeout = setTimeout(() => {
      this.goInactive();
    }, inactivity_delay);
    
    if (this.isInactive) {
      this.isInactive = false;
      this.allClients.broadcastStatus(this);
      return true
    }
    return false
  }

  goOffline() {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }
    this.allClients.broadcastStatus(this, offline);
  }

  setStatus(status) {
    const { type, data } = parseUserStatus(status);

    if (type === "online") {
      this.customStatus = null;
    } else {
      this.customStatus = { type, data };
    }
    if (!this.resetInactivity()) {
      this.allClients.broadcastStatus(this);
    }
  }

  status() {
    if (this.isInactive) {
      return inactive;
    } else if (this.customStatus) {
      return this.customStatus
    } else {
      return online;
    }
  }
}
