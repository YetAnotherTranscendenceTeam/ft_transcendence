import Ajv from "ajv";
import addFormats from "ajv-formats";
import { HttpError, properties } from "yatt-utils";

const ajv = new Ajv();
addFormats(ajv);

export const validateUser = ajv.compile({
  type: "object",
  properties: {
    sub: { type: "string" },
    email: { type: "string", format: "email" },
    given_name: { type: "string" },
    picture: { type: "string", format: 'uri' },
  },
  required: ["sub", "email"],
});


export function getUser(payload) {
  if (!validateUser(payload)) {
    console.log(validateUser.errors);
    throw new HttpError.BadGateway();
  }
  
  return {
    id: payload.sub,
    email: payload.email,
    username: getUsername(payload.given_name, payload.sub),
    picture: payload.picture,
  }
}

function getUsername(name, googleId) {
  if (!name) {
    return null;
  }
  if (name.length >= properties.username.minLength) {
    return name.slice(0, properties.username.maxLength);
  }
  return `${name}${googleId.slice(0, 4)}`;
}
