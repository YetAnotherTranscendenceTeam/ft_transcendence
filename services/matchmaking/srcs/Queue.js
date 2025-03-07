import { Lobby } from "./Lobby.js";

const LOBBY_TOLERANCE_INCREMENT = 1.0;

export class Queue {
  /**
   * @type {Lobby[]}
   */
  lobbies = [];

  constructor(gamemode, lobbyConnection) {
    this.gamemode = gamemode;
    this.lobbyConnection = lobbyConnection
  }

  queue(lobby) {
    this.lobbies.push(lobby);
  }

  unqueue(lobby) {
    const index = this.lobbies.indexOf(lobby);
    if (index === -1) return;
    this.lobbies.splice(index, 1);
  }

  getBestMatch(lobby, start_index) {
    let best_match = null;
    let best_rating = Infinity;
    for (let i = start_index; i < this.lobbies.length; i++) {
      const other = this.lobbies[i];
      if (lobby === other) continue;
      const rating = lobby.getMatchRating(other);
      if (rating <= best_rating) {
        best_match = other;
        best_rating = rating;
      }
    }
    return { match: best_match, rating: best_rating };
  }

  matchmake() {
    for (let i = 0; i < this.lobbies.length; i++) {
      const lobby = this.lobbies[i];
      lobby.tolerance += LOBBY_TOLERANCE_INCREMENT;
      const { match, rating } = this.getBestMatch(lobby, i + 1);
      if (!match || rating > Math.min(lobby.tolerance, match.tolerance)) {
        continue;
      }
      // create match
      // TODO: implement match creation
      this.matchLobbies([lobby, match]);
    }
  }
  matchLobbies(lobbies) {
    lobbies.forEach((lobby) => {
      this.unqueue(lobby);
    });
    console.log(`Matched lobbies ${lobby1.joinSecret} and ${lobby2.joinSecret}`);
    this.lobbyConnection.socket.send(
      JSON.stringify({
        event: "match",
        data: {
          lobbies,
          match_id: undefined // TODO: implement match id (match server)
        },
      })
    )
  }
}
