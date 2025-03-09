import { createUsers, users } from "../../dummy/dummy-account";
import { createLobby, joinLobby, lobbiesURL } from "../../dummy/lobbies-player";
import request from "superwstest";

createUsers(10);

const LOBBY_DESTRUCTION_DELAY = 3000;

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
    for (let i = 1; i < players[0].lobby.mode.team_size * players[0].lobby.mode.team_count; i++) {
      let player = await joinLobby(users[i], players[0]);
      await Promise.all(players.map((p) => p.expectJoin(users[i].account_id)));
      players.push(player);
    }
  });
  it(`change game mode`, () => {
    players[0].ws.sendJson({ event: "mode", data: { mode: "unranked_2v2" } });
  });
  it(`expect game mode change`, async () => {
    await Promise.all(
      players.map((player) =>
        player.ws.expectJson((message) => {
          expect(message.event).toBe("mode_change");
          expect(message.data.mode).toStrictEqual({
            name: "unranked_2v2",
            team_size: 2,
            team_count: 2,
            ranked: false,
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
    for (let i = 1; i < players[0].lobby.mode.team_size * players[0].lobby.mode.team_count; i++) {
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
      player.ws.expectClosed(1000, "Kicked from lobby").close();
    }
  });
});

describe("Ownership transfer (by leaving group)", () => {
  const players = [];
  it(`create a lobby and join with players`, async () => {
    players.push(await createLobby(users[0]));
    for (let i = 1; i < players[0].lobby.mode.team_size * players[0].lobby.mode.team_count; i++) {
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
              .sendJson({ event: "mode", data: { mode: "unranked_2v2" } })
              .expectJson((message) => expect(message.event).toBe("error"))
          )
      );
      if (players[0]) {
        players[0].ws.sendJson({ event: "mode", data: { mode: "unranked_2v2" } });
        await Promise.all(
          players.map((p) =>
            p.ws.expectJson((message) => {
              expect(message.event).toBe("mode_change");
              expect(message.data.mode).toStrictEqual({
                name: "unranked_2v2",
                team_size: 2,
                team_count: 2,
                ranked: false,
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
      .ws(`/join?token=${users[0].jwt}`)
      .expectClosed(1008, "Already in a lobby")
      .close();
  });
  it(`User 1 attempt to create another lobby`, async () => {
    await request(lobbiesURL)
      .ws(`/join?token=${users[1].jwt}`)
      .expectClosed(1008, "Already in a lobby")
      .close();
  });
  it(`User 0 attempt to join the original lobby`, async () => {
    await request(lobbiesURL)
      .ws(`/join?token=${users[0].jwt}&secret=${lobby.joinSecret}`)
      .expectClosed(1008, "Already in a lobby")
      .close();
  });
  it(`User 1 attempt to join the original lobby`, async () => {
    await request(lobbiesURL)
      .ws(`/join?token=${users[1].jwt}&secret=${lobby.joinSecret}`)
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

describe("Lobby creation with gamemode", () => {
  const testGamemode = async (gamemode) => {
    const lobby = await createLobby(users[0], gamemode);
    let player;
    if (gamemode.team_count != 1 && gamemode.team_size != 1) {
      player = await joinLobby(users[1], lobby);
      expect(player.lobby.mode).toStrictEqual(gamemode);
    }
    if (gamemode.team_count != 1 && gamemode.team_size != 1) {
      await lobby.expectJoin(users[1].account_id);
      await player.close();
      await lobby.expectLeave(users[1].account_id);
    }
    await lobby.close();
  };
  test("create a lobby with ranked_1v1 gamemode", async () => {
    await testGamemode({
      name: "ranked_1v1",
      team_size: 1,
      team_count: 2,
      ranked: true,
    });
  });
  test("create a lobby with ranked_2v2 gamemode", async () => {
    await testGamemode({
      name: "ranked_2v2",
      team_size: 2,
      team_count: 2,
      ranked: true,
    });
  });
  test("create a lobby with unranked_1v1 gamemode", async () => {
    await testGamemode({
      name: "unranked_1v1",
      team_size: 1,
      team_count: 2,
      ranked: false,
    });
  });
  test("create a lobby with unranked_2v2 gamemode", async () => {
    await testGamemode({
      name: "unranked_2v2",
      team_size: 2,
      team_count: 2,
      ranked: false,
    });
  });
});

describe("Move player inside lobby", () => {
  let players = [];
  test("create and join a lobby", async () => {
    players.push(await createLobby(users[0]));
    for (let i = 1; i < players[0].lobby.mode.team_size * players[0].lobby.mode.team_count; i++) {
      let player = await joinLobby(users[i], players[0]);
      await Promise.all(players.map((p) => p.expectJoin(users[i].account_id)));
      players.push(player);
    }
  });
  test("move player", async () => {
    await players[0].ws.sendJson({
      event: "swap_players",
      data: { account_ids: [users[0].account_id, users[1].account_id] },
    });
    await Promise.all(
      players.map((player) =>
        player.ws.expectJson((message) => {
          expect(message.event).toBe("swap_players");
          expect(message.data.account_ids).toStrictEqual([
            users[0].account_id,
            users[1].account_id,
          ]);
        })
      )
    );
  });
  // checks if ownership is transferred
  test("move players[1] back to it's original position", async () => {
    await players[1].ws.sendJson({
      event: "swap_players",
      data: { account_ids: [users[0].account_id, users[1].account_id] },
    });
    await Promise.all(
      players.map((player) =>
        player.ws.expectJson((message) => {
          expect(message.event).toBe("swap_players");
          expect(message.data.account_ids).toStrictEqual([
            users[0].account_id,
            users[1].account_id,
          ]);
        })
      )
    );
  });
  test("leave lobby", async () => {
    while (players.length > 0) {
      let player = players.pop();
      await player.close();
      await Promise.all(players.map((p) => p.expectLeave(player.user.account_id)));
    }
  });
});

describe("Join full lobby", () => {
  const testgamemode = async (gamemode) => {
    let players = [];
    players.push(await createLobby(users[0], gamemode));
    const lobby_capacity = gamemode.ranked ? gamemode.team_size : gamemode.team_size * gamemode.team_count;
    for (let i = 1; i < lobby_capacity; i++) {
      let player = await joinLobby(users[i], players[0]);
      await Promise.all(players.map((p) => p.expectJoin(users[i].account_id)));
      players.push(player);
    }
    await request(lobbiesURL)
      .ws(`/join?token=${users[players.length].jwt}&secret=${players[0].joinSecret}`)
      .expectClosed(1008, "Lobby is not in a joinable state")
      .close();
    while (players.length > 0) {
      let player = players.pop();
      await player.close();
      await Promise.all(players.map((p) => p.expectLeave(player.user.account_id)));
    }
  };
  test("1v1 ranked lobby", () => {
    return testgamemode({
      name: "ranked_1v1",
      team_size: 1,
      team_count: 2,
      ranked: true,
    });
  });
  test("2v2 ranked lobby", () => {
    return testgamemode({
      name: "ranked_2v2",
      team_size: 2,
      team_count: 2,
      ranked: true,
    });
  });
  test("2v2 unranked lobby", () => {
    return testgamemode({
      name: "unranked_2v2",
      team_size: 2,
      team_count: 2,
      ranked: false,
    });
  });
  test("1v1 unranked lobby", () => {
    return testgamemode({
      name: "unranked_1v1",
      team_size: 1,
      team_count: 2,
      ranked: false,
    });
  });
});

describe("Change gamemode with too many players", () => {
  const testgamemode = async (gamemode) => {
    let players = [];
    players.push(
      await createLobby(users[0], {
        name: "unranked_2v2",
        team_size: 2,
        team_count: 2,
        ranked: false,
      })
    );
    const lobby_capacity = gamemode.ranked ? gamemode.team_size : gamemode.team_size * gamemode.team_count;
    for (let i = 1; i <= lobby_capacity; i++) {
      let player = await joinLobby(users[i], players[0]);
      await Promise.all(players.map((p) => p.expectJoin(users[i].account_id)));
      players.push(player);
    }
    await players[0].ws
      .sendJson({ event: "mode", data: { mode: gamemode.name } })
      .expectJson((message) => {
        if (message.event != "error") {
          console.log(message);
        }
        expect(message.event).toBe("error");
      });
    while (players.length > 0) {
      let player = players.pop();
      await player.close();
      await Promise.all(players.map((p) => p.expectLeave(player.user.account_id)));
    }
  };
  test("1v1 ranked lobby", () => {
    return testgamemode({
      name: "ranked_1v1",
      team_size: 1,
      team_count: 1,
      ranked: true,
    });
  });
  test("2v2 ranked lobby", () => {
    return testgamemode({
      name: "ranked_2v2",
      team_size: 2,
      team_count: 1,
      ranked: true,
    });
  });
  test("1v1 unranked lobby", () => {
    return testgamemode({
      name: "unranked_1v1",
      team_size: 1,
      team_count: 2,
      ranked: false,
    });
  });
});
