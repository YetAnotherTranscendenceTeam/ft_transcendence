import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv();
addFormats(ajv);

export const validateToken = ajv.compile({
  type: "object",
  properties: {
    access_token: { type: "string" },
  },
  required: ["access_token"],
});

export const validateUser = ajv.compile({
  type: "object",
  properties: {
    id: { type: "integer" },
    email: { type: "string", format: "email" },
    login: { type: "string" },
    image: {
      type: "object",
      properties: {
        link: { type: "string", format: 'uri' },
      },
      required: ["link"],
    }
  },
  required: ["id", "email", "login", "image"],
});
