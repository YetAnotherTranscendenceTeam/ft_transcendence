import request from "superwstest";
import { matchmakingURL } from "./gamemodes";
import { apiURL } from "../../URLs";

export async function finishMatch(app, match_id, winner) {
  await request(apiURL)
    .delete(`/pong/matches/${match_id}`)
    .set("Authorization", `Bearer ${app.jwt.pong.sign({})}`)
    .expect(200);
  await request(matchmakingURL)
    .patch(`/matches/${match_id}`)
    .set("Authorization", `Bearer ${app.jwt.match_management.sign({})}`)
    .send({
      state: 2,
      score_0: winner === 0 ? 1 : 0,
      score_1: winner === 1 ? 1 : 0,
    })
    .expect(200);
}
