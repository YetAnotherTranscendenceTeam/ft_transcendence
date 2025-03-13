import YATT from "yatt-utils";

export async function userInfos(account_id, clients) {
  const user = {
    account_id: account_id,
    status: clients.get(account_id)?.status ?? "offline",
  }

  try {
    user.profile = await YATT.fetch(`http://db-profiles:3000/${account_id}`)
  } catch (err) {
    console.log('userinfo');
    console.error(err);
  }
  return user;
}
