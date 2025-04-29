import request from "supertest";
import { apiURL } from "../URLs";

export async function testFriendship(user1, user2) {
  const response1 = await request(apiURL)
    .post(`/social/requests/${user1.account_id}`)
    .set("Authorization", `Bearer ${user2.jwt}`)

  expect(response1.statusCode).toEqual(204);

  const response2 = await request(apiURL)
    .post(`/social/requests/${user2.account_id}`)
    .set("Authorization", `Bearer ${user1.jwt}`)

  expect(response2.statusCode).toEqual(204);
};
