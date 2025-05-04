"use strict";

import { adjectives } from "./adjectives.js";
import { animals } from "./animals.js";
import crypto from "crypto"

export function generateUsername() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  return adjective.charAt(0).toUpperCase()
    + adjective.slice(1).toLowerCase()
    + animal.charAt(0).toUpperCase()
    + animal.slice(1).toLowerCase();
}

export function backupUsername() {
  return `${crypto.randomBytes(2).toString('hex')}-${crypto.randomBytes(2).toString('hex')}-${crypto.randomBytes(2).toString('hex')}`;
}
