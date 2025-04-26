"use strict";

import YATT from "yatt-utils";
import * as dbAction from "../utils/dbAction.js"
import { inactivity_delay } from "../app/env.js";
import { inactive, offline, online } from "./activityStatuses.js";
import { fetchProfiles, userInfos } from "./userInfos.js";
import { WsError } from "yatt-ws";

export class Client {
  account_id;
  sockets = new Set();

  isInactive = false;
  customStatus = null;

  offlineTimeout = null;
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

  send(payload, target) {
    const data = JSON.stringify(payload);
    this.sockets.forEach(socket => {
      socket.send(data);
    });
  }

  async welcome(clients, socket) {
    // Retreive all friends / pending requests / blocked
    const friends = dbAction.selectFriendships(this.account_id).map(f => f.account_id);
    const pending = {
      sent: dbAction.selectRequestsSent(this.account_id).map(r => r.account_id),
      received: dbAction.selectRequestsReceived(this.account_id).map(r => r.account_id),
    }
    const blocked = dbAction.selectBlocks(this.account_id).map(b => b.account_id);

    // Fetch all related profiles
    const profiles = await fetchProfiles([...friends, ...pending.sent, ...pending.received, ...blocked]);

    // Send welcome payload
    const payload = {
      event: "welcome",
      data: {
        friends: await Promise.all(friends.map(id =>
          userInfos(id, clients, { profiles, include_status: true })
        )),
        pending: {
          sent: await Promise.all(pending.sent.map(id =>
            userInfos(id, clients, { profiles })
          )),
          received: await Promise.all(pending.received.map(id =>
            userInfos(id, clients, { profiles })
          )),
        },
        blocked: await Promise.all(blocked.map(id =>
          userInfos(id, clients, { profiles })
        )),
        self: this.status(),
      }
    };
    const data = JSON.stringify(payload);
    socket.send(data);
  };

  async newFriendRequestSent(receiver, profile) {
    const payload = {
      event: "receive_new_friend_request",
      data: {
        ...await userInfos(receiver, this.allClients, { profile }),
        sender: this.account_id,
      },
    }
    this.send(payload);
  };

  async newFriendRequestReceived(sender) {
    const payload = {
      event: "receive_new_friend_request",
      data: {
        ...await userInfos(sender, this.allClients),
        sender,
      },
    }
    this.send(payload);
  };

  async deleteFriendRequest(sender, receiver) {
    const payload = {
      event: "receive_delete_friend_request",
      data: {
        account_id: sender !== this.account_id ? sender : receiver,
        sender
      },
    };
    this.send(payload);
  };

  async newFriend(account_id, clients) {
    const payload = {
      event: "receive_new_friend",
      data: await userInfos(account_id, clients),
    }
    this.send(payload);
  }

  async deleteFriend(account_id, clients) {
    const payload = {
      event: "receive_delete_friend",
      data: await userInfos(account_id, clients),
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
    const { type, data } = status;

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

  async sendLobbyInvite(invite) {
    if (invite.account_id === this.account_id) {
      throw new WsError.UserUnavailable({ account_id: this.account_id });
    }

    const target = this.allClients.get(invite.account_id);
    if (!target) {
      throw new WsError.UserUnavailable({ account_id: invite.account_id });
    }

    try {
      this.username = (await YATT.fetch(`http://db-profiles:3000/${this.account_id}`))?.username;
    } catch (err) {
      console.error(err);
      throw new WsError.BadGateway();
    }

    target.send({
      event: "receive_lobby_invite", data: {
        username: this.username,
        gamemode: invite.gamemode,
        join_secret: invite.join_secret
      }
    });
  }

  async sendLobbyJoinRequest(request) {
    if (request.account_id === this.account_id) {
      throw new WsError.UserUnavailable({ account_id: this.account_id });
    }

    const target = this.allClients.get(request.account_id);
    if (!target) {
      throw new WsError.UserUnavailable({ account_id: request.account_id });
    }

    try {
      this.username = (await YATT.fetch(`http://db-profiles:3000/${this.account_id}`))?.username;
    } catch (err) {
      console.error(err);
      throw new WsError.BadGateway();
    }

    target.send({
      event: "receive_lobby_request", data: {
        account_id: this.account_id,
        username: this.username,
      }
    });
  }
}
