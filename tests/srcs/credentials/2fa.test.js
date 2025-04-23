import { properties } from "../../../modules/yatt-utils/srcs";
import { credentialsURL } from "../../URLs";
import { createUsers, users } from "../../dummy/dummy-account";
import request from "supertest";

createUsers(2);

let account_id;

beforeAll(() => {
  account_id = users[0].account_id;
})

it("non existing account_id", async () => {
  const response = await request(credentialsURL)
    .post(`/accounts/99999999999/otp_methods/app`)

  expect(response.statusCode).toBe(404);
});

describe("otp_methods Router", () => {
  it("bad account_id", async () => {
    const response = await request(credentialsURL)
      .post(`/accounts/:account_id/otp_methods/:otp_method`)

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("params/account_id must be integer");
  });

  it("bad otp_method", async () => {
    const response = await request(credentialsURL)
      .post(`/accounts/${account_id}/otp_methods/:otp_method`)

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("params/method must be equal to one of the allowed values");
  });

  it("add method", async () => {
    const response = await request(credentialsURL)
      .post(`/accounts/${account_id}/otp_methods/app`)

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      account_id,
      method: "app",
      created_at: expect.any(String),
    });
  });

  it("conflict", async () => {
    const response = await request(credentialsURL)
      .post(`/accounts/${account_id}/otp_methods/app`)

    expect(response.statusCode).toBe(409);
  });

  it("delete", async () => {
    const response = await request(credentialsURL)
      .delete(`/accounts/${account_id}/otp_methods/app`)

    expect(response.statusCode).toBe(204);
  });

  it("not found", async () => {
    const response = await request(credentialsURL)
      .delete(`/accounts/${account_id}/otp_methods/app`)

    expect(response.statusCode).toBe(404);
  });

  it("readd method", async () => {
    const response = await request(credentialsURL)
      .post(`/accounts/${account_id}/otp_methods/app`)

    expect(response.statusCode).toBe(200);
  });

  it("get by id", async () => {
    const getbyid = await request(credentialsURL)
      .get(`/${account_id}`)

    expect(getbyid.statusCode).toBe(200);
    expect(getbyid.body.otp_methods).toEqual(["app"]);
  });

  it("re delete", async () => {
    const response = await request(credentialsURL)
      .delete(`/accounts/${account_id}/otp_methods/app`)

    expect(response.statusCode).toBe(204);

    const getbyid = await request(credentialsURL)
      .get(`/${account_id}`)

    expect(getbyid.statusCode).toBe(200);
    expect(getbyid.body.otp_methods).toEqual([]);
  });

  properties.otp_method.enum.forEach(method => {
    it(`add ${method}`, async () => {
      const response = await request(credentialsURL)
        .post(`/accounts/${account_id}/otp_methods/${method}`)

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        account_id,
        method,
        created_at: expect.any(String),
      });
    });
  })

  it("verify methods", async () => {
    const getbyid = await request(credentialsURL)
      .get(`/${account_id}`)

    expect(getbyid.statusCode).toBe(200);
    expect(getbyid.body.otp_methods).toEqual(
      expect.arrayContaining(properties.otp_method.enum));
  });
});
