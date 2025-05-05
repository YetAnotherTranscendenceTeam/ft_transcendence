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
        state: lobby.state,
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

  updateMatch(match_update) {
    const payload = {
      event: "match_update",
      data: JSON.stringify({
        players: match_update.players,
        match_id: match_update.match_id,
        scores: match_update.scores,
        state: match_update.state,
        gamemode: match_update.gamemode,
      }),
    };
    this.broadcast(payload);
  }

  endTournament(tournament_update) {
    const payload = {
      event: "end_tournament",
      data: JSON.stringify({
        players: tournament_update.players.map(p => p.account_id)
      }),
    };
    this.broadcast(payload);
  };

  broadcast(payload) {
    this.subscriptions.forEach(subscription => {
      subscription.sse(payload)
    });
  };

};

export const activityEvents = new ActivityEvents();
