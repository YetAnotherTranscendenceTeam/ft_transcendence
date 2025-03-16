import request from "superwstest";
import { createUsers, users } from "../../dummy/dummy-account";

createUsers(1);
const socialUrl = 'ws://127.0.0.1:4123';
const mainUrl = "https://127.0.0.1:7979";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('Social websocket', () => {
  it("exceed maximum connections", async () => {
    const connections = [];

    // Create 5 valid connections
    for (let i = 0; i < 5; ++i) {
      const ws = await request(socialUrl)
        .ws(`/notify?access_token=${users[0].jwt}`)
        .expectJson((message) => {
          expect(message.event).toBe("welcome");
          expect(message.data.follows).toEqual([])
        });
      connections.push(ws);
    }

    // Attempt to create one more connection (should fail)
    await request(socialUrl)
      .ws(`/notify?access_token=${users[0].jwt}`)
      .expectClosed(3000, "Unauthorized");

    // Close all open connections
    for (const ws of connections) {
      ws.send(JSON.stringify({ event: "goodbye" }));
    }
  });
});
