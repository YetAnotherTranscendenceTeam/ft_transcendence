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

export function userInfos(account_id, clients, profiles, options = {}) {
  const user = {
    account_id: account_id,
    profile: profiles.get(account_id)
  };

  if (options.include_status === true) {
    const target = clients.get(account_id);
    if (target) {
      user.status = target.status();
    } else {
      user.status = offline;
    }
  };
  return user;
}
