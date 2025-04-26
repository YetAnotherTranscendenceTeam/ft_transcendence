"use strict";

import YATT from "yatt-utils";
import { offline } from "./activityStatuses.js";

export async function fetchProfiles(accounts) {
  const map = new Map();

  try {
    const profiles = await YATT.fetch(`http://db-profiles:3000/?filter[account_id]=${accounts.join(",")}`);
    profiles.forEach(profile => map.set(profile.account_id, profile));
  } catch (err) { }

  return map;
};

export async function userInfos(account_id, clients, options = {}) {
  const user = { account_id };

  // Attach user profile
  if (options.profiles) {
    user.profile = options.profiles.get(account_id);
  } else if (options.profile) {
    user.profile = options.profile;
  } else {
    try {
      user.profile = await YATT.fetch(`http://db-profiles:3000/${account_id}`);
    } catch (err) {
      user.profile = null;
    }
  }

  if (options.include_status === true) {
    // Attach user status
    const target = clients.get(account_id);
    if (target) {
      user.status = target.status();
    } else {
      user.status = offline;
    }
  };

  return user;
}
