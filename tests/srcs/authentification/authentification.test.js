import request from "supertest";
import { properties } from "../../../modules/yatt-utils/srcs";

const baseUrl = "http://127.0.0.1:4022";

describe("POST /", () => {
  it("root", async () => {
    const response = await request(baseUrl)
      .get("/")
      .expect(404)
      .expect("Content-Type", /json/);
  });

  it("no body", async () => {
    const response = await request(baseUrl)
      .post("/")
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body must be object",
    });
  });

  it("no email", async () => {
    const response = await request(baseUrl)
      .post("/")
      .send({})
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body must have required property 'email'",
    });
  });

  it("no password", async () => {
    const response = await request(baseUrl)
      .post("/")
      .send({
        email: ""
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body must have required property 'password'",
    });
  });

  it("bad email type", async () => {
    const response = await request(baseUrl)
      .post("/")
      .send({
        email: {},
        password: "",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body/email must be string",
    });
  });

  it("bad email format", async () => {
    const response = await request(baseUrl)
      .post("/")
      .send({
        email: "",
        password: "",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body/email must match format \"email\"",
    });
  });

  it("password too short", async () => {
    const response = await request(baseUrl)
      .post("/")
      .send({
        email: "test@test.com",
        password: "",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: `body/password must NOT have fewer than ${properties.password.minLength} characters`,
    });
  });

  it("password too long", async () => {
    const response = await request(baseUrl)
      .post("/")
      .send({
        email: "test@test.com",
        password: "QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: `body/password must NOT have more than ${properties.password.maxLength} characters`,
    });
  });
});
