import YATT, { HttpError, properties } from "yatt-utils";

export default function routes(fastify, opts, done) {
  let schema = {
    body: {
      type: "object",
      properties: {
        email: properties.email,
        password: properties.password,
      },
      required: ["email", "password"],
      additionalProperties: false,
    },
    response: {
      200: {
        description: "Successfull account creation",
        type: "object",
        properties: {
          code: properties.code,
          message: properties.message,
          account: {
            type: "object",
            properties: {
              account_id: properties.account_id,
              email: properties.email,
            },
            required: ["account_id", "email"],
          },
        },
        required: ["code", "message", "account"],
      },
      409: {
        description: "Email address is already associated with an account",
        type: "object",
        properties: {
          statusCode: properties.statusCode,
          code: properties.code,
          error: properties.error,
          message: properties.message,
        },
        required: ["statusCode", "code", "error", "message"],
      },
    },
  };

  fastify.post("/", { schema }, async function handler(request, reply) {
    const { email, password } = request.body;

    const hash = await YATT.crypto.hashPassword(password, pepper);
    // Add account to database
    try {
      const newAccount = await YATT.fetch(`http://credentials:3000/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          hash: hash.hash,
          salt: hash.salt,
        }),
      });
      console.log("ACCOUNT CREATED:", {
        account_id: newAccount.account_id,
        email: email,
        "auth-method": "password",
      });
      reply.code(201).send({
        code: "REGISTER_SUCCESS",
        message: "You account has successfully been created",
        account: {
          account_id: newAccount.account_id,
          email: email,
        },
      });
    } catch (err) {
      if (err instanceof HttpError) {
        if (err.statusCode == 409) {
          return reply.code(409).send({
            statusCode: 409,
            code: "AUTH_EMAIL_IN_USE",
            error: "Email Already In Use",
            message: `This email is already associated with an account`,
          });
        }
        // console.error(err);
        return err.send(reply);
      }
      // console.error(err);
      throw err;
    }
  });
  done();
}

const pepper = process.env.PASSWORD_PEPPER
if (!pepper) {
  console.error("Missing environment variable: PASSWORD_PEPPER");
  process.exit(1);
}
