import YATT, { HttpError } from "yatt-utils";
import { password_pepper } from "../app/env.js";

export const patchAccount = new Map([
  ["password_auth", patchPasswordAuth],
  ["google_auth", patchGoogleAuth],
  ["fortytwo_auth", patchFortytwoAuth]],
);

const keysToDelete = ["old_password", "auth_method"];

async function patchPasswordAuth(request, reply, currentEmail) {
  const { old_password } = request.body;

  // Check that old_password is correct
  const credentials = await YATT.fetch(`http://credentials:3000/password/${currentEmail}`);
  if (!await YATT.crypto.verifyPassword(old_password, credentials.hash, credentials.salt, password_pepper)) {
    throw new HttpError.Forbidden();
  }

  // Remove unnecessary keys
  keysToDelete.forEach(key => delete request.body[key]);
  if (!Object.keys(request.body).length) {
    throw new HttpError.BadRequest();
  }

  // Hash new password
  request.body.password &&= await YATT.crypto.hashPassword(request.body.password, password_pepper);

  // Update credential database
  await YATT.fetch(`http://credentials:3000/password/${request.account_id}`, {
    method: "PATCH",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(request.body),
  });
}

async function patchGoogleAuth(request, reply) {
  throw new HttpError.NotImplemented();
}

async function patchFortytwoAuth(request, reply) {

  // Remove unnecessary keys
  keysToDelete.forEach(key => delete request.body[key]);
  if (!Object.keys(request.body).length) {
    throw new HttpError.BadRequest();
  }

  // Update credential database
  await YATT.fetch(`http://credentials:3000/fortytwo/${request.account_id}`, {
    method: "PATCH",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(request.body),
  });
}
