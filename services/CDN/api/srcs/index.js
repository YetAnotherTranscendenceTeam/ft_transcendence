"use strict";

import build from "./app/builder.js";

const server = build({
  bodyLimit: 6 * 1024 * 1024 // 5 MB
});

server.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});
