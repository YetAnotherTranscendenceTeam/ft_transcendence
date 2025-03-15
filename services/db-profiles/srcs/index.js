"use strict";

import build from "./app/builder.js";
import qs from "qs";

const server = build({
  querystringParser: str => qs.parse(str)
});

server.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});
