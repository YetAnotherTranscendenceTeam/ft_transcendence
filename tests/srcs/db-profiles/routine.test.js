import request from "supertest";
import crypto from "crypto";

const profilesURL = "http://127.0.0.1:7001"

describe("Profile creation routine", () => {
  it("no body", async () => {
    const response = await request(profilesURL)
      .post("/")
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: 'body must be object'
    })
  })

  it("empty body", async () => {
    const response = await request(profilesURL)
      .post("/")
      .send({})
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: "body must have required property 'account_id'"
    })
  })

  it("no username", async () => {
    const response = await request(profilesURL)
      .post("/")
      .send({
        account_id: 45,
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: "body must have required property 'username'"
    })
  })

  it("bad account_id", async () => {
    const response = await request(profilesURL)
      .post("/")
      .send({
        account_id: "",
        username: "",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: "body/account_id must be integer"
    })
  })

  it("bad username", async () => {
    const response = await request(profilesURL)
      .post("/")
      .send({
        account_id: "",
        username: 56,
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: "body/account_id must be integer"
    })
  })

  it("username too shot", async () => {
    const response = await request(profilesURL)
      .post("/")
      .send({
        account_id: parseInt(Math.random() * 2000000),
        username: "",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: "body/username must NOT have fewer than 4 characters"
    })
  })

  it("username too long", async () => {
    const response = await request(profilesURL)
      .post("/")
      .send({
        account_id: parseInt(Math.random() * 2000000),
        username: "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: "body/username must NOT have more than 10 characters"
    })
  })

  const dummyProfile = {
    account_id: parseInt(Math.random() * 10000000 + 1000000),
    username: crypto.randomBytes(5).toString("hex"),
  };

  it("sucess no avatar", async () => {
    const response = await request(profilesURL)
      .post("/")
      .send({
        account_id: dummyProfile.account_id,
        username: dummyProfile.username,
      })
      .expect(201)
      .expect("Content-Type", /json/);
  })

  it("get account created", async () => {
    const response = await request(profilesURL)
      .get(`/${dummyProfile.account_id}`)
      .expect(200)
      .expect("Content-Type", /json/);

    expect(response.body.account_id).toEqual(dummyProfile.account_id);
    expect(response.body.username).toEqual(dummyProfile.username);
    expect(response.body.avatar).toEqual("");
    expect(response.body.created_at).toEqual(response.body.updated_at);
  })

  it("get by username", async () => {
    const response = await request(profilesURL)
      .get(`/usernames/${dummyProfile.username}`)
      .expect(200)
      .expect("Content-Type", /json/);

    expect(response.body.account_id).toEqual(dummyProfile.account_id);
    expect(response.body.username).toEqual(dummyProfile.username);
    expect(response.body.avatar).toEqual("");
    expect(response.body.created_at).toEqual(response.body.updated_at);
  })

  it("delete profile", async () => {
    const response = await request(profilesURL)
      .delete(`/${dummyProfile.account_id}`)
      .expect(204)
  })

  it("delete non existing profile", async () => {
    const response = await request(profilesURL)
      .delete(`/${dummyProfile.account_id}`)
      .expect(404)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 404,
      code: 'ACCOUNT_NOT_FOUND',
      error: 'Account Not Found',
      message: 'The requested account does not exist'
    });
  })

  it("get nonexisting", async () => {
    const response = await request(profilesURL)
      .get(`/${dummyProfile.account_id}`)
      .expect(404)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 404,
      code: 'ACCOUNT_NOT_FOUND',
      error: 'Account Not Found',
      message: 'The requested account does not exist'
    });
  })

  it("get by nonexisting username", async () => {
    const response = await request(profilesURL)
      .get(`/usernames/${dummyProfile.username}`)
      .expect(404)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 404,
      code: 'ACCOUNT_NOT_FOUND',
      error: 'Account Not Found',
      message: 'The requested account does not exist'
    });
  })

  it("invalid avatar", async () => {
    const response = await request(profilesURL)
      .post("/")
      .send({
        account_id: dummyProfile.account_id,
        username: dummyProfile.username,
        avatar: "not and uri",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: 'body/avatar must match format "uri"'
    })
  })

  dummyProfile.avatar = "https://picsum.photos/200/300"

  it("success with avatar", async () => {
    const response = await request(profilesURL)
      .post("/")
      .send({
        account_id: dummyProfile.account_id,
        username: dummyProfile.username,
        avatar: dummyProfile.avatar,
      })
      .expect(201)
      .expect("Content-Type", /json/);
  })

  it("get account created", async () => {
    const response = await request(profilesURL)
      .get(`/${dummyProfile.account_id}`)
      .expect(200)
      .expect("Content-Type", /json/);

    expect(response.body.account_id).toEqual(dummyProfile.account_id);
    expect(response.body.username).toEqual(dummyProfile.username);
    expect(response.body.avatar).toEqual(dummyProfile.avatar);
    expect(response.body.created_at).toEqual(response.body.updated_at);
  })

  it("delete profile", async () => {
    const response = await request(profilesURL)
      .delete(`/${dummyProfile.account_id}`)
      .expect(204)
  })

  it("delete non existing profile", async () => {
    const response = await request(profilesURL)
      .delete(`/${dummyProfile.account_id}`)
      .expect(404)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 404,
      code: 'ACCOUNT_NOT_FOUND',
      error: 'Account Not Found',
      message: 'The requested account does not exist'
    });
  })

  it("get nonexisting profile", async () => {
    const response = await request(profilesURL)
      .get(`/${dummyProfile.account_id}`)
      .expect(404)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 404,
      code: 'ACCOUNT_NOT_FOUND',
      error: 'Account Not Found',
      message: 'The requested account does not exist'
    });
  })
});

