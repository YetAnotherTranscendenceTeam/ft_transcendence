import request from "supertest";
import { apiURL } from "../../../URLs";
import { createUsers, users } from "../../../dummy/dummy-account";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

createUsers(1);

describe('Account Deletion', () => {
  it("deprecated route should 404", async () => {
    const response = await request(apiURL)
      .delete("/settings/account")
      .set("Authorization", `Bearer ${users[0].jwt}`);

    expect(response.statusCode).toBe(404);
  })
});
