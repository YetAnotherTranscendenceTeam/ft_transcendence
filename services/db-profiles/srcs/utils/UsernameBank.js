"use strict";

import db from "../app/database.js";
import { generateUsername, backupUsername } from "./generateUsername.js";

export class UsernameBank {
  main = [];
  backup = [];
  refillThreshold = 80;

  constructor() {
    this.fillMain();
    this.fillBackup();
  }

  getUsername(useBackup = false) {
    if (!useBackup) {
      return this.main.pop() || this.backup.pop();
    }
    return this.backup.pop();
  }

  #dupCheck = db.prepare("SELECT * FROM profiles WHERE username = ?");

  fillMain(count = 100) {
    let failures = 0;
    while (this.main.length < count && failures < 100) {
      // Insert dictionary generated usernames
      const username = generateUsername();
      if (username?.length <= 15 && !this.main.includes(username) && !this.#dupCheck.get(username)) {
        this.main.push(username);
      } else {
        failures++;
      }
    }
  }

  fillBackup(count = 100) {
    while (this.backup.length < count) {
      // Insert randomly generated backup usernames
      const username = backupUsername();
      this.backup.push(username);
    }
  }

  checkAndRefill() {
    if (this.main.length < this.refillThreshold) {
      this.fillMain();
    }
    if (this.backup.length < this.refillThreshold) {
      this.fillBackup();
    }
  }
}
