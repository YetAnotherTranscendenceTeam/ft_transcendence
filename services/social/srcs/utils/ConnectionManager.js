"use strict";

import { offline_delay } from "../app/env.js";
import { Client } from "./Client.js";
import * as dbAction from "../utils/dbAction.js";

export class ConnectionManager {
  map = new Map();

  constructor() {
    this.interval = setInterval(() => { this.pingAllSockets(); }, 30000);
  };

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
  };

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
      // console.log("GOING OFFLINE:", { account_id: client.account_id, in: offline_delay });
    }
  };

  broadcastStatus(client, status = client.status(), self = true) {
    // Prepare broadcast payload
    const payload = {
      event: "receive_status",
      data: { account_id: client.account_id, status }
    };
    // console.log("BROADCASTING:", { account_id: client.account_id, payload: JSON.stringify(payload) });

    // Get notification target(s)
    const targets = dbAction.selectFriendships(client.account_id).map(f => f.account_id);
    if (self) {
      // Add own account
      targets.push(client.account_id);
    }

    // Send payload to each target
    targets.forEach(id => {
      this.map.get(id)?.send(payload);
    });

    client.lastBroadcast = payload;
  };

  get(account_id) {
    const data = this.map.get(account_id);
    return data;
  };

  pingAllSockets() {
    this.map.forEach(client => {
      client.sockets.forEach(socket => {
        socket.ping();
      })
    });
  };

  async newFriendRequest(sender, receiver, receiver_profile) {
    await this.get(sender)?.newFriendRequestSent(receiver, receiver_profile);
    if (!dbAction.isBlocked(receiver, sender)) {
      await this.get(receiver)?.newFriendRequestReceived(sender);
    }
    console.log("NEW FRIEND REQUEST:", { sender, receiver });
  };

  deleteFriendRequest(sender, receiver, options = {}) {
    this.get(sender)?.deleteFriendRequest(sender, receiver);
    if (options.force === receiver || !dbAction.isBlocked(receiver, sender)) {
      this.get(receiver)?.deleteFriendRequest(sender, receiver);
    }
    console.log("DELETE FRIEND REQUEST:", { sender, receiver });
  };

  async newFriendship(user1, user2, user2_profile) {
    await Promise.all([
      this.get(user1)?.newFriendship(user2, user2_profile),
      this.get(user2)?.newFriendship(user1)
    ]);
    console.log("NEW FRIENDSHIP:", [user1, user2]);
  };

  async deleteFriendship(user1, user2) {
    await Promise.all([
      this.get(user1)?.deleteFriendship(user2),
      this.get(user2)?.deleteFriendship(user1)
    ]);
    console.log("DELETE FRIENDSHIP:", [user1, user2]);
  };

}; // class ConnectionManager
