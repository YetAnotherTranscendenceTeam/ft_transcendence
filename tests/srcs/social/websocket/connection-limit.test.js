import request from "superwstest";
import { createUsers, users } from "../../../dummy/dummy-account";
import { socialWS } from "../../../URLs";

createUsers(1);

describe('Social websocket', () => {
  it("exceed maximum connections", async () => {
    const connections = [];

    // Create 5 valid connections
    for (let i = 0; i < 5; ++i) {
      const ws = await request(socialWS)
        .ws(`/notify?access_token=${users[0].jwt}`)
        .expectJson((message) => {
          expect(message.event).toBe("welcome");
          expect(message.data.friends).toEqual([]);
          expect(message.data.pending).toEqual({ sent: [], received: [] });
          expect(message.data.blocked).toEqual([]);
          expect(message.data.self).toEqual({ type: "online" });
        });
      connections.push(ws);
    }

    // Attempt to create one more connection (should fail)
    await request(socialWS)
      .ws(`/notify?access_token=${users[0].jwt}`)
      .expectClosed(3000, "Unauthorized");

    // Close all open connections
    for (const ws of connections) {
      ws.send(JSON.stringify({ event: "goodbye" }));
    }
  });
});
