import { users } from "../../dummy/dummy-account";
import request from "superwstest";

const lobbiesURL = "http://localhost:4043";

class Player {
  constructor(ws, joinSecret, user) {
    this.ws = ws;
    this.joinSecret = joinSecret;
    this.user = user;
  }
  close() {
    return this.ws.close();
  }
  expectJoin(account_id) {
    return this.ws.expectJson((message) => {
      expect(message.event).toBe("player_join");
      expect(message.data.player.account_id).toBe(account_id);
    });
  }
  expectLeave(account_id) {
    return this.ws.expectJson((message) => {
      expect(message.event).toBe("player_leave");
      expect(message.data.player.account_id).toBe(account_id);
    });
  }
}

const createLobby = (user) => {
  return new Promise((resolve, reject) => {
    let joinSecret;
    const ws = request(lobbiesURL)
      .ws("/join")
      .set("Authorization", `Bearer ${user.jwt}`)
      .expectJson((message) => {
        expect(message.event).toBe("player_join");
        expect(message.data.player.account_id).toBe(user.account_id);
      })
      .expectJson((message) => {
        expect(message.event).toBe("lobby");
        expect(message.data.lobby.players.length).toBe(1);
        expect(message.data.lobby.joinSecret).toBeDefined();
        expect(message.data.lobby.mode).toStrictEqual({
          name: "1v1",
          team_size: 1,
        });
        expect(message.data.lobby.state).toStrictEqual({
          type: "waiting",
          joinable: true,
        });
        joinSecret = message.data.lobby.joinSecret;
        resolve(new Player(ws, joinSecret, user));
      });
  });
};

const joinLobby = (user, lobbyconnection) => {
  return new Promise((resolve, reject) => {
    const ws = request(lobbiesURL)
      .ws(`/join?secret=${lobbyconnection.joinSecret}`)
      .set("Authorization", `Bearer ${user.jwt}`)
      .expectJson((message) => {
        expect(message.event).toBe("player_join");
        expect(message.data.player.account_id).toBe(user.account_id);
      })
      .expectJson((message) => {
        expect(message.event).toBe("lobby");
        expect(
          message.data.lobby.players.find(
            (player) => player.account_id === user.account_id
          )
        ).toBeDefined();
        resolve(new Player(ws, lobbyconnection.joinSecret, user));
      });
  });
};

describe("Mass lobby creation", () => {
  let lobbies = [];
  it(`create lobbies`, async () => {
    for (let i = 0; i < users.length; i++) {
      const lobby = await createLobby(users[i]);
      expect(lobbies.find((l) => l.joinSecret === lobby.joinSecret)).toBeUndefined();
      lobbies.push(lobby);
    }
  });
  it(`close lobbies`, async () => {
    await Promise.all(lobbies.map((lobby) => lobby.close()));
  });
  it(`check if lobbies are destroyed`, async () => {
    await Promise.all(
      lobbies.map((lobby, i) => {
        request(lobbiesURL)
          .ws(`/join?secret=${lobby.joinSecret}`)
          .set("Authorization", `Bearer ${users[i].jwt}`)
          .expectClosed(1008, "Invalid secret")
          .close();
      })
    );
  });
});

describe("Lobby join/leave messages", () => {
  let players = [];
  it(`create a lobby`, async () => {
    const lobby = await createLobby(users[0]);
    players.push(lobby);
  });
  it(`join a lobby`, async () => {
    const player = await joinLobby(users[1], players[0]);
    players.forEach((player) => player.expectJoin(users[1].account_id));
    players.push(player);
  });
  it(`leave a lobby`, async () => {
    await players[1].close();
    await players[0].expectLeave(users[1].account_id);
    await players[0].close();
  });
});

describe("Lobby game mode change", () => {
  const players = [];
  it(`create a lobby and join with players`, async () => {
    players.push(await createLobby(users[0]));
    for (let i = 1; i < users.length; i++) {
      let player = await joinLobby(users[i], players[0]);
      await Promise.all(players.map((p) => p.expectJoin(users[i].account_id)));
      players.push(player);
    }
  });
  it(`change game mode`, () => {
    players[0].ws.sendJson({ event: "mode", data: { mode: "2v2" } });
  });
  it(`expect game mode change`, async () => {
    await Promise.all(
      players.map((player) =>
        player.ws.expectJson((message) => {
          expect(message.event).toBe("mode_change");
          expect(message.data.mode).toStrictEqual({
            name: "2v2",
            team_size: 2,
          });
        })
      )
    );
  });
  it(`quit lobby and expect leave messages`, async () => {
    while (players.length > 0) {
      let player = players.pop();
      await player.close();
      await Promise.all(players.map((p) => p.expectLeave(player.user.account_id)));
    }
  });
});

describe("Lobby kick system", () => {
  const players = [];
  it(`create a lobby and join with players`, async () => {
    players.push(await createLobby(users[0]));
    for (let i = 1; i < users.length; i++) {
      let player = await joinLobby(users[i], players[0]);
      await Promise.all(players.map((p) => p.expectJoin(users[i].account_id)));
      players.push(player);
    }
  });
  it(`kick players and expect leave messages`, async () => {
    while (players.length > 0) {
      let player = players.pop();
      if (players[0])
        players[0].ws.sendJson({
          event: "kick",
          data: { account_id: player.user.account_id },
        });
      // last player (group owner)
      else
        player.ws.sendJson({
          event: "kick",
          data: { account_id: player.user.account_id },
        });
      await Promise.all(players.map((p) => p.expectLeave(player.user.account_id)));
    }
  });
});

describe("Ownership transfer", () => {
  const players = [];
  it(`create a lobby and join with players`, async () => {
    players.push(await createLobby(users[0]));
    for (let i = 1; i < users.length; i++) {
      let player = await joinLobby(users[i], players[0]);
      await Promise.all(players.map((p) => p.expectJoin(users[i].account_id)));
      players.push(player);
    }
  });
  it(`quit lobby, expect leave messages and test ownership (with gamemode change)`, async () => {
    while (players.length > 0) {
      let player = players.shift();
      await player.close();
      await Promise.all(players.map((p) => p.expectLeave(player.user.account_id)));
      await Promise.all(
        players
          .slice(1)
          .map((p) =>
            p.ws
              .sendJson({ event: "mode", data: { mode: "2v2" } })
              .expectJson((message) => expect(message.event).toBe("error"))
          )
      );
      if (players[0]) {
        players[0].ws.sendJson({ event: "mode", data: { mode: "2v2" } });
        await Promise.all(
          players.map((p) =>
            p.ws.expectJson((message) => {
              expect(message.event).toBe("mode_change");
              expect(message.data.mode).toStrictEqual({
                name: "2v2",
                team_size: 2,
              });
            })
          )
        );
      }
    }
  });
});

describe("Player join multiple lobbies", () => {
  let lobby;
  let player;
  it(`create a lobby and join it with another user`, async () => {
    lobby = await createLobby(users[0]);
    player = await joinLobby(users[1], lobby);
    await lobby.expectJoin(users[1].account_id);
  });
  it(`User 0 attempt to create another lobby`, async () => {
    await request(lobbiesURL)
      .ws("/join")
      .set("Authorization", `Bearer ${users[0].jwt}`)
      .expectClosed(1008, "Already in a lobby")
      .close();
  });
  it(`User 1 attempt to create another lobby`, async () => {
    await request(lobbiesURL)
      .ws("/join")
      .set("Authorization", `Bearer ${users[1].jwt}`)
      .expectClosed(1008, "Already in a lobby")
      .close();
  });
  it(`User 0 attempt to join the original lobby`, async () => {
    await request(lobbiesURL)
      .ws(`/join?secret=${lobby.joinSecret}`)
      .set("Authorization", `Bearer ${users[0].jwt}`)
      .expectClosed(1008, "Already in a lobby")
      .close();
  });
  it(`User 1 attempt to join the original lobby`, async () => {
    await request(lobbiesURL)
      .ws(`/join?secret=${lobby.joinSecret}`)
      .set("Authorization", `Bearer ${users[1].jwt}`)
      .expectClosed(1008, "Already in a lobby")
      .close();
  });
  it(`quit lobby and expect leave messages`, async () => {
    await player.close();
    await lobby.expectLeave(users[1].account_id);
    await lobby.close();
  });
});

describe("Stats", () => {
  it(`check stats`, async () => {
    await request(lobbiesURL)
      .get("/stats")
      .set("Authorization", `Bearer ${users[0].jwt}`)
      .send()
      .expect(200)
      .then((res) => {
        expect(res.body.lobby_count).toBe(0);
        expect(res.body.player_count).toBe(0);
      });
  });
  it(`create a lobby and check stats`, async () => {
    const lobby = await createLobby(users[0]);
    await request(lobbiesURL)
      .get("/stats")
      .set("Authorization", `Bearer ${users[0].jwt}`)
      .send()
      .expect(200)
      .then((res) => {
        expect(res.body.lobby_count).toBe(1);
        expect(res.body.player_count).toBe(1);
      });
    await lobby.close();
  });
});
