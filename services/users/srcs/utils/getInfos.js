"use strict";

import YATT from "yatt-utils";

export default async function getInfos(account_id, me = false) {
    const profile = await YATT.fetch(`http://db-profiles:3000/${account_id}`);
    if (me) {
        const credentials = await YATT.fetch(`http://credentials:3000/${account_id}`)
        profile.credentials = credentials;
        const active_matches = await YATT.fetch(`http://matchmaking:3000/users/${account_id}/matches?filter[state][]=0&filter[state][]=1`);
        profile.active_match = active_matches;
    }
    return profile;
}
