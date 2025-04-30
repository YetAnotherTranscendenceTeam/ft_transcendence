"use strict";

class ActivityEvents {
  subscriptions = new Set();

  addSubscription(subscription) {
    subscription.sse({ event: "subscribed", data: {} });
    this.subscriptions.add(subscription);
  };

  removeSubscription(subscription) {
    this.subscriptions.delete(subscription);
  };

  update(lobby) {
    const payload = {
      event: "update",
      data: JSON.stringify({
        players: lobby.players.map(p => p.account_id),
        gamemode: lobby.mode,
      }),
    };
    this.broadcast(payload);
  };

  leave(lobby, leaver_id) {
    const payload = {
      event: "leave",
      data: leaver_id,
    }
    this.broadcast(payload);
    this.update(lobby);
  };

  broadcast(payload) {
    this.subscriptions.forEach(subscription => {
      subscription.sse(payload)
    });
  };

};

export const activityEvents = new ActivityEvents();
