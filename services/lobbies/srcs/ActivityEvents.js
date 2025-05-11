"use strict";

class ActivityEvents {
  subscriptions = new Set();

  constructor() {
    setInterval(() => {
      this.subscriptions.forEach(subscription => {
        subscription.sseComment("");
      });
    }, 20000);
  }

  addSubscription(subscription) {
    subscription.sse({ event: "subscribed", data: {} });
    this.subscriptions.add(subscription);
  };

  removeSubscription(subscription) {
    this.subscriptions.delete(subscription);
  };

  update(lobby) {
    const payload = {
      event: "lobby_update",
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
      event: "lobby_leave",
      data: leaver_id,
    }
    this.broadcast(payload);
    this.update(lobby);
  };

  updateMatch({ match_id, players, tournament_id, gamemode, state }) {
    const payload = {
      event: "match_update",
      data: JSON.stringify({
        match_id,
        players,
        tournament_id,
        gamemode,
        state
      }),
    };
    this.broadcast(payload);
  }

  updateTournament({ tournament_id, players, team_count, gamemode, stage, active }) {
    const payload = {
      event: "tournament_update",
      data: JSON.stringify({
        tournament_id,
        players,
        team_count,
        gamemode,
        stage,
        active,
      }),
    };
    console.error("TOURNEY UPDATE SENT FROM LOBBIES", payload);
    this.broadcast(payload);
  };

  broadcast(payload) {
    this.subscriptions.forEach(subscription => {
      subscription.sse(payload)
    });
  };

};

export const activityEvents = new ActivityEvents();
