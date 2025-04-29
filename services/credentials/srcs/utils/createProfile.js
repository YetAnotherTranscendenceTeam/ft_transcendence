"use strict";

import YATT from "yatt-utils";
import db from "../app/database.js";

export async function createProfile(account_id) {
  try {
    await YATT.fetch("http://db-profiles:3000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ account_id }),
    });
  } catch (err) {
    db.prepare(`DELETE FROM accounts WHERE account_id = ?`).run(account_id);
    throw err;
  }
}
