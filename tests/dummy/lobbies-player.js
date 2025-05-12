import request from "superwstest";
import { Lobby } from "yatt-lobbies";

export const lobbiesURL = "http://localhost:4043";

export class Player {
  constructor(ws, join_secret, user, lobby) {
    this.ws = ws;
    this.join_secret = join_secret;
    this.user = user;
    this.lobby = new Lobby(lobby);
  }
  close() {
    return this.ws.sendJson({ event: "disconnect" }).expectClosed(1000, "DISCONNECTED").close();
  }

  getIndex() {
    return this.lobby.players.findIndex((player) => player.account_id === this.user.account_id);
  }

  expectJoin(account_id) {
    return this.ws.expectJson((message) => {
      expect(message.event).toBe("player_join");
      expect(message.data.player.account_id).toBe(account_id);
      this.lobby.addPlayer(message.data.player);
    });
  }
  async expectLeave(account_id) {
    if (this.lobby.leader_account_id === account_id)
      await this.expectLeaderChange(this.lobby.players[0].account_id === account_id ? this.lobby.players[1].account_id : this.lobby.players[0].account_id);
    return await this.ws.expectJson((message) => {
      if (message.event != "player_leave")
        console.log({event: message.event, data: message.data, connection: this});
      expect(message.event).toBe("player_leave");
      expect(message.data.player.account_id).toBe(account_id);
      this.lobby.removePlayer(this.lobby.players.findIndex((player) => player.account_id === account_id));
    });
  }

  expectLeaderChange(account_id) {
    return this.ws.expectJson((message) => {
      expect(message.event).toBe("leader_change");
      expect(message.data.leader_account_id).toBe(account_id);
      this.lobby.leader_account_id = message.data.leader_account_id;
    });
  }

  expectMatchParameters(params) {
    return this.ws.expectJson((message) => {
      expect(message.event).toBe("match_parameters");
      expect(message.data.match_parameters).toBeDefined();
      expect(message.data.match_parameters).toMatchObject(params);
      this.lobby.match_parameters = message.data.match_parameters;
    });
  }

  join(user) {
    return joinLobby(user, this);
  }
}

export const createLobby = (user, gamemode) => {
  let isGamemodeDefined = gamemode !== undefined;
  if (!isGamemodeDefined) {
    gamemode = {
      name: "unranked_2v2",
      team_size: 2,
      team_count: 2,
      type: "unranked",
    };
  }
  return new Promise((resolve, reject) => {
    let join_secret;
    const ws = request(lobbiesURL)
      .ws(`/join?access_token=${user.jwt}${isGamemodeDefined ? `&gamemode=${gamemode.name}` : ""}`)
      .expectJson((message) => {
        expect(message.event).toBe("lobby");
        expect(message.data.lobby.players.length).toBe(1);
        expect(message.data.lobby.join_secret).toBeDefined();
        expect(message.data.lobby.mode).toMatchObject(gamemode);
        expect(message.data.lobby.leader_account_id).toBe(user.account_id);
        expect(message.data.lobby.state).toStrictEqual({
          type: "waiting",
          joinable: true,
        });
        join_secret = message.data.lobby.join_secret;
        resolve(new Player(ws, join_secret, user, message.data.lobby));
      });
  });
};

export const joinLobby = (user, lobbyconnection) => {
  return new Promise((resolve, reject) => {
    const ws = request(lobbiesURL)
      .ws(`/join?access_token=${user.jwt}&secret=${lobbyconnection.join_secret}`);
    ws.expectJson((message) => {
      expect(message.event).toBe("lobby");
      expect(
        message.data.lobby.players.find((player) => player.account_id === user.account_id)
      ).toBeDefined();
      resolve(new Player(ws, lobbyconnection.join_secret, user, message.data.lobby));
    });
  });
};
