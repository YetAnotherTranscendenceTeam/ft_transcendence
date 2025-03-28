import YATT from "yatt-utils";
import { offline } from "./activityStatuses.js";

export async function userInfos(account_id, clients) {
  const user = { account_id };

  const target =  clients.get(account_id);
  if (target) {
    user.status = target.status();
  } else {
    user.status = offline;
  }

  try {
    user.profile = await YATT.fetch(`http://db-profiles:3000/${account_id}`)
  } catch (err) {
    console.error(err);
  }
  return user;
}
