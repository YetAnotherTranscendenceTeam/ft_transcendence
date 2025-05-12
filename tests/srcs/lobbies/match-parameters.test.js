import { createUsers, users } from "../../dummy/dummy-account";
import { createLobby, joinLobby, lobbiesURL } from "../../dummy/lobbies-player";
import request from "superwstest";

createUsers(4);

describe("Match Parameters", () => {
  let players = [];
	it("create a lobby with 4 players", async () => {
    players.push(await createLobby(users[0], {
      name: "custom_2v2",
      team_count: 2,
      team_size: 2,
      type: "custom"
    }));
    for (let i = 1; i < 4; i++) {
      const player = await joinLobby(users[i], players[0]);
      for (let player of players) {
        player.expectJoin(users[i].account_id);
      }
      players.push(player);
    }
	});
  it("change match parameters", async () => {
    const newParams = {
      obstacles: false,
      events: [],
      ball_speed: 1,
      point_to_win: 2
    }
    await players[0].ws.sendJson({
      event: "match_parameters",
      data: newParams
    });
    for (let player of players) {
      await player.expectMatchParameters(newParams);
    }
  });
  it("leave the lobby", async () => {
    while (players.length > 0) {
      const player = players.pop();
      await player.close();
      for (let other of players) {
        other.expectLeave(player.user.account_id);
      }
    }
  });
});