import request from "superwstest";

export const lobbiesURL = "http://localhost:4043";

export class Player {
  constructor(ws, joinSecret, user, lobby) {
	this.ws = ws;
	this.joinSecret = joinSecret;
	this.user = user;
	this.lobby = lobby;
  }
  close() {
	return this.ws.sendJson({ event: "disconnect" }).expectClosed(1000, "Disconnected").close();
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
	  ranked: false,
	};
  }
  return new Promise((resolve, reject) => {
	let joinSecret;
	const ws = request(lobbiesURL)
	  .ws(`/join?token=${user.jwt}${isGamemodeDefined ? `&gamemode=${gamemode.name}` : ""}`)
	  .expectJson((message) => {
		expect(message.event).toBe("player_join");
		expect(message.data.player.account_id).toBe(user.account_id);
	  })
	  .expectJson((message) => {
		expect(message.event).toBe("lobby");
		expect(message.data.lobby.players.length).toBe(1);
		expect(message.data.lobby.joinSecret).toBeDefined();
		expect(message.data.lobby.mode).toStrictEqual(gamemode);
		expect(message.data.lobby.state).toStrictEqual({
		  type: "waiting",
		  joinable: true,
		});
		joinSecret = message.data.lobby.joinSecret;
		resolve(new Player(ws, joinSecret, user, message.data.lobby));
	  });
  });
};

export const joinLobby = (user, lobbyconnection) => {
  return new Promise((resolve, reject) => {
	const ws = request(lobbiesURL)
	  .ws(`/join?token=${user.jwt}&secret=${lobbyconnection.joinSecret}`)
	  .expectJson((message) => {
		expect(message.event).toBe("player_join");
		expect(message.data.player.account_id).toBe(user.account_id);
	  })
	  .expectJson((message) => {
		expect(message.event).toBe("lobby");
		expect(
		  message.data.lobby.players.find((player) => player.account_id === user.account_id)
		).toBeDefined();
		resolve(new Player(ws, lobbyconnection.joinSecret, user, message.data.lobby));
	  });
  });
};