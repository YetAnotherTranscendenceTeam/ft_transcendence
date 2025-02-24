"use strict";

import YATT from "yatt-utils";

export default async function getInfos(account_id) {
    const profile = await YATT.fetch(`http://db-profiles:3000/${account_id}`);
    return { ...profile };
}
