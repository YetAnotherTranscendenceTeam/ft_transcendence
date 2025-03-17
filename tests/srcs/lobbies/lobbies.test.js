import { createUsers, users } from "../../dummy/dummy-account";
import { createLobby, joinLobby, lobbiesURL } from "../../dummy/lobbies-player";
import request from "superwstest";

createUsers(32);

const LOBBY_DESTRUCTION_DELAY = 3000;

describe("Mass lobby creation", () => {
  let lobbies = [];
  it(`create lobbies`, async () => {
    for (let i = 0; i < users.length; i++) {
      const lobby = await createLobby(users[i]);
      expect(lobbies.find((l) => l.join_secret === lobby.join_secret)).toBeUndefined();
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
          if (message.event != "mode_change") {
            console.log(message);
          }
          expect(message.event).toBe("mode_change");
          expect(message.data.mode).toStrictEqual({
            name: "unranked_2v2",
            team_size: 2,
            team_count: 2,
            type: "unranked",
          });
        })
      )
    );
  });
  it(`quit lobby and expect leave messages`, async () => {
    while (players.length > 0) {
      let player = players.pop();
      await player.close();
      for (let other of players) {
        await other.expectLeave(player.user.account_id);
      }
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
      for (let other of players) {
        await other.expectLeave(player.user.account_id);
      }
      player.ws.expectClosed(1000, "Kicked from lobby").close();
    }
  });
});

describe("Leadership transfer (by leaving group)", () => {
  const players = [];
  it(`create a lobby and join with players`, async () => {
    players.push(await createLobby(users[0]));
    for (let i = 1; i < players[0].lobby.mode.team_size * players[0].lobby.mode.team_count; i++) {
      let player = await joinLobby(users[i], players[0]);
      await Promise.all(players.map((p) => p.expectJoin(users[i].account_id)));
      players.push(player);
    }
  });
  it(`quit lobby, expect leave messages and test leadership (with gamemode change)`, async () => {
    let owner_index = players.findIndex((p) => p.user.account_id == players[0].lobby.leader_account_id);
    while (players.length > 0) {
      let owner = players[owner_index];
      players.splice(owner_index, 1);
      owner.close();
      await Promise.all(players.map((p) => p.expectLeave(owner.user.account_id)));
      if (players.length == 0)
        continue;
      owner_index = players.findIndex((p) => p.user.account_id == players[0].lobby.leader_account_id);
      owner = players[owner_index];
      owner.ws.sendJson({ event: "mode", data: { mode: "unranked_2v2" } });
      await Promise.all(
        players.map((player) =>
          player.ws.expectJson((message) => {
            expect(message.event).toBe("mode_change");
            expect(message.data.mode).toStrictEqual({
              name: "unranked_2v2",
              team_size: 2,
              team_count: 2,
              type: "unranked",
            });
          })
        )
      );
    }
  });
});

describe("Single connection tests", () => {
  let lobby;
  let player;
  it(`create a 2v2 ranked lobby and join it with another user`, async () => {
    lobby = await createLobby(users[0], {
      name: "ranked_2v2",
      team_size: 2,
      team_count: 2,
      type: "ranked",
    });
    player = await joinLobby(users[1], lobby);
    await lobby.expectJoin(users[1].account_id);
  });
  it(`User 0 attempt to join lobby`, async () => {
    const old = lobby;
    lobby = await joinLobby(users[0], lobby);
    await old.ws.expectClosed(1008, "Logged in from another location").close();
  });
  it(`User 1 attempt to join lobby`, async () => {
    const old = player;
    player = await joinLobby(users[1], player);
    await old.ws.expectClosed(1008, "Logged in from another location").close();
  });
  it(`User 1 attempt to create another lobby`, async () => {
    const old = player;
    player = await createLobby(users[1]);
    await old.ws.expectClosed(1008, "Logged in from another location").close();
    lobby.expectLeave(users[1].account_id);
    // leave new lobby and join back to the old one
    player.close();
    player = await joinLobby(users[1], lobby);
    await lobby.expectJoin(users[1].account_id);
  });
  it(`User 0 attempt to create another lobby`, async () => {
    const old = lobby;
    lobby = await createLobby(users[0]);
    await old.ws.expectClosed(1008, "Logged in from another location").close();
    await player.expectLeave(users[0].account_id);
  });
  it(`Disconnect users`, async () => {
    await player.close();
    await lobby.close();
  });
});

describe("Lobby creation with gamemode", () => {
  const testGamemode = async (gamemode) => {
    const lobby = await createLobby(users[0], gamemode);
    let player;
    if (gamemode.team_count != 1 && gamemode.team_size != 1) {
      player = await joinLobby(users[1], lobby);
      expect(player.lobby.mode.toJSON()).toStrictEqual(gamemode);
    }
    if (gamemode.team_count != 1 && gamemode.team_size != 1) {
      await lobby.expectJoin(users[1].account_id);
      await player.close();
      await lobby.expectLeave(users[1].account_id);
    }
    await lobby.close();
  };
  it("create a lobby with ranked_1v1 gamemode", async () => {
    await testGamemode({
      name: "ranked_1v1",
      team_size: 1,
      team_count: 2,
      type: "ranked",
    });
  });
  it("create a lobby with ranked_2v2 gamemode", async () => {
    await testGamemode({
      name: "ranked_2v2",
      team_size: 2,
      team_count: 2,
      type: "ranked",
    });
  });
  it("create a lobby with unranked_1v1 gamemode", async () => {
    await testGamemode({
      name: "unranked_1v1",
      team_size: 1,
      team_count: 2,
      type: "unranked",
    });
  });
  it("create a lobby with unranked_2v2 gamemode", async () => {
    await testGamemode({
      name: "unranked_2v2",
      team_size: 2,
      team_count: 2,
      type: "unranked",
    });
  });
});

describe("Move player inside lobby", () => {
  let players = [];
  it("create and join a lobby", async () => {
    players.push(await createLobby(users[0]));
    for (let i = 1; i < players[0].lobby.mode.team_size * players[0].lobby.mode.team_count; i++) {
      let player = await joinLobby(users[i], players[0]);
      await Promise.all(players.map((p) => p.expectJoin(users[i].account_id)));
      players.push(player);
    }
  });
  it("move player", async () => {
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
  it("move players[1] back to it's original position", async () => {
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
  it("leave lobby", async () => {
    while (players.length > 0) {
      let player = players.pop();
      await player.close();
      for (let other of players) {
        await other.expectLeave(player.user.account_id);
      }
    }
  });
});

describe("Join full lobby", () => {
  const testgamemode = async (gamemode) => {
    let players = [];
    players.push(await createLobby(users[0], gamemode));
    const lobby_capacity =
      gamemode.type === "ranked" ? gamemode.team_size : gamemode.team_size * gamemode.team_count;
    for (let i = 1; i < lobby_capacity; i++) {
      let player = await joinLobby(users[i], players[0]);
      await Promise.all(players.map((p) => p.expectJoin(users[i].account_id)));
      players.push(player);
    }
    await request(lobbiesURL)
      .ws(`/join?token=${users[players.length].jwt}&secret=${players[0].join_secret}`)
      .expectClosed(1008, "Lobby is full")
      .close();
    while (players.length > 0) {
      let player = players.pop();
      await player.close();
      for (let other of players) {
        await other.expectLeave(player.user.account_id);
      }
    }
  };
  it("1v1 ranked lobby", () => {
    return testgamemode({
      name: "ranked_1v1",
      team_size: 1,
      team_count: 2,
      type: "ranked",
    });
  });
  it("2v2 ranked lobby", () => {
    return testgamemode({
      name: "ranked_2v2",
      team_size: 2,
      team_count: 2,
      type: "ranked",
    });
  });
  it("2v2 unranked lobby", () => {
    return testgamemode({
      name: "unranked_2v2",
      team_size: 2,
      team_count: 2,
      type: "unranked",
    });
  });
  it("1v1 unranked lobby", () => {
    return testgamemode({
      name: "unranked_1v1",
      team_size: 1,
      team_count: 2,
      type: "unranked",
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
        type: "unranked",
      })
    );
    const lobby_capacity =
      gamemode.type === "ranked" ? gamemode.team_size : gamemode.team_size * gamemode.team_count;
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
      for (let other of players) {
        await other.expectLeave(player.user.account_id);
      }
    }
  };
  it("1v1 ranked lobby", () => {
    return testgamemode({
      name: "ranked_1v1",
      team_size: 1,
      team_count: 1,
      type: "ranked",
    });
  });
  it("2v2 ranked lobby", () => {
    return testgamemode({
      name: "ranked_2v2",
      team_size: 2,
      team_count: 1,
      type: "ranked",
    });
  });
  it("1v1 unranked lobby", () => {
    return testgamemode({
      name: "unranked_1v1",
      team_size: 1,
      team_count: 2,
      type: "unranked",
    });
  });
});

describe("Team names", () => {
  let players = [];
  it("create a 32 players tournament lobby", async () => {
    players.push(
      await createLobby(users[0], {
        name: "tournament_2v2",
        team_size: 2,
        team_count: 16,
        type: "tournament",
      })
    );
    for (let i = 1; i < players[0].lobby.mode.team_size * players[0].lobby.mode.team_count; i++) {
      let player = await joinLobby(users[i], players[0]);
      await Promise.all(players.map((p) => p.expectJoin(users[i].account_id)));
      players.push(player);
    }
  });
  it("set team names", async () => {
    for (let i = 0; i < players.length; i++) {
      const team_index = players[i].getIndex() % players[i].lobby.getTeamCount();
      players[i].ws.sendJson({
        event: "team_name",
        data: { name: `Team ${team_index}` },
      });
      Promise.all(
        players.map((player) =>
          player.ws.expectJson((message) => {
            if (message.event != "team_name") {
              console.log(message);
            }
            expect(message.event).toBe("team_name");
            expect(message.data.team_index).toBe(team_index);
            expect(message.data.name).toBe(`Team ${team_index}`);
          })
        )
      );
    }
  });
  it("leave and join back (check if server stores the right lobby names)", async () => {
    const player = players.pop();
    await player.close();
    Promise.all(players.map((p) => p.expectLeave(player.user.account_id)));
    const newPlayer = await joinLobby(player.user, players[0]);
    await Promise.all(players.map((p) => p.expectJoin(player.user.account_id)));
    expect(newPlayer.lobby.team_names.length).toBe(players[0].lobby.mode.team_count);
    for (let i = 0; i < newPlayer.lobby.team_names.length; i++) {
      const name = `Team ${i}`;
      expect(newPlayer.lobby.team_names[i]).toBe(name);
    }
    players.push(newPlayer);
  });
  it("leave lobby", async () => {
    while (players.length > 0) {
      let player = players.pop();
      await player.close();
      for (let other of players) {
        await other.expectLeave(player.user.account_id);
      }
    }
  });
});

describe("Lobby unqueue on leave", () => {
  let players = [];
  it("create a unranked 2v2 lobby and fill it up", async () => {
    players.push(
      await createLobby(users[0], {
        name: "unranked_2v2",
        team_size: 2,
        team_count: 2,
        type: "unranked",
      })
    );
    for (let i = 1; i < players[0].lobby.mode.team_size * players[0].lobby.mode.team_count; i++) {
      let player = await joinLobby(users[i], players[0]);
      await Promise.all(players.map((p) => p.expectJoin(users[i].account_id)));
      players.push(player);
    }
  });
  it("queue the lobby", async () => {
    players[0].ws.sendJson({ event: "queue_start" });
    await Promise.all(
      players.map((player) =>
        player.ws.expectJson((message) => {
          expect(message.event).toBe("state_change");
          expect(message.data.state.type).toBe("queued");
        })
      )
    );
  });
  it("1 player leaves the lobby and expect unqueue", async () => {
    const player = players.pop();
    await player.close();
    await Promise.all(players.map((p) => p.expectLeave(player.user.account_id)));
    await Promise.all(
      players.map((player) =>
        player.ws.expectJson((message) => {
          expect(message.event).toBe("state_change");
          expect(message.data.state.type).toBe("waiting");
        })
      )
    );
  });
  it("leave lobby", async () => {
    while (players.length > 0) {
      let player = players.pop();
      await player.close();
      for (let other of players) {
        await other.expectLeave(player.user.account_id);
      }
    }
  });
});

describe("Leave a 2v2 tournament lobby starting from differente indexes", () => {
  const attempts = Array.from({ length: 32 }, (_, i) => i);
  test.each(attempts)("attempt %i", async (attempt) => {
    let players = [];
    players.push(
      await createLobby(users[0], {
        name: "tournament_2v2",
        team_size: 2,
        team_count: 16,
        type: "tournament",
      })
    );
    for (let i = 1; i < players[0].lobby.mode.team_size * players[0].lobby.mode.team_count; i++) {
      let player = await joinLobby(users[i], players[0]);
      await Promise.all(players.map((p) => p.expectJoin(users[i].account_id)));
      players.push(player);
    }
    for (let i = 0; i < players.length; i++) {
      const index = (i + attempt) % players.length;
      const player = players[index];
      await player.close();
      players[index] = null;
      for (let other of players) {
        if (!other)
            continue;
        await other.expectLeave(player.user.account_id);
      }
    }
  });
});

describe("swap team members", () => {
  let players = [];
  it("create a 2v2 unranked lobby and fill it up", async () => {
    players.push(
      await createLobby(users[0], {
        name: "unranked_2v2",
        team_size: 2,
        team_count: 2,
        type: "unranked",
      })
    );
    for (let i = 1; i < players[0].lobby.mode.team_size * players[0].lobby.mode.team_count; i++) {
      let player = await joinLobby(users[i], players[0]);
      await Promise.all(players.map((p) => p.expectJoin(users[i].account_id)));
      players.push(player);
    }
  });
  let swaps = [[1,0], [2,3]];
  let failing_swaps = [[1,2], [2,1], [3,0], [1,3]];
  it.each(swaps)("swap players %i", async (a, b) => {
    players[a].ws.sendJson({ event: "swap_players", data: { account_ids: [users[a].account_id, users[b].account_id] } });
    await Promise.all(players.map((player) => player.ws.expectJson((message) => {
      expect(message.event).toBe("swap_players");
      expect(message.data.account_ids).toStrictEqual([users[a].account_id, users[b].account_id]);
    })));
  });
  it.each(failing_swaps)("fail to swap players %i", async (a, b) => {
    players[a].ws.sendJson({ event: "swap_players", data: { account_ids: [users[a].account_id, users[b].account_id] } });
    await players[a].ws.expectJson((message) => {
      expect(message.event).toBe("error");
    });
  });
  it("leave lobby", async () => {
    while (players.length > 0) {
      let player = players.pop();
      await player.close();
      for (let other of players) {
        await other.expectLeave(player.user.account_id);
      }
    }
  });
})
