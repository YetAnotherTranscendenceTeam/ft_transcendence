import { adjectives } from "./adjectives.js";
import { animals } from "./animals.js";
import crypto from "crypto"

export function generateUsername() {
  for (let i = 0; i < 20; ++i) {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];

    if (adjective.length + animal.length <= 15) {
      return adjective.charAt(0).toUpperCase() + adjective.slice(1).toLowerCase() + animal.charAt(0).toUpperCase() + animal.slice(1).toLowerCase()
    }
  }
  return randomString();
}

export function randomString() {
  return crypto.randomBytes(7).toString('hex');
}
