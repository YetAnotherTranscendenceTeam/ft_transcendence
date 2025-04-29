import request from "superwstest";
import { matchmakingURL } from "./gamemodes";

export function finishMatch(app, match_id, winner) {
  return request(matchmakingURL)
	.patch(`/matches/${match_id}`)
	.set("Authorization", `Bearer ${app.jwt.match_management.sign({})}`)
	.send({
	  state: 2,
	  score_0: winner === 0 ? 1 : 0,
	  score_1: winner === 1 ? 1 : 0,
	})
	.expect(200);
}