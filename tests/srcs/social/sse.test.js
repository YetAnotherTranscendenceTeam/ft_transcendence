"user strict";

import { EventSource } from 'eventsource';
import { lobbiesSSE } from '../../URLs';
import { app } from '../../dummy/dummy-account';

beforeAll(async () => {
  await app.ready();
})

describe("/lobbies/notify connection", () => {
  it("no Authorization", async () => {
    await new Promise((resolve, reject) => {
      const es = new EventSource(lobbiesSSE);

      es.onopen = () => {
        es.close();
        reject();
      }

      es.onerror = (err) => {
        try {
          expect(err.code).toBe(401);
          es.close();
          resolve();
        } catch (error) {
          es.close();
          reject(error);
        }
      };
    });
  });

  it("garbage Authorization", async () => {
    await new Promise((resolve, reject) => {
      const es = new EventSource(lobbiesSSE, {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            headers: {
              ...init.headers,
              Authorization: 'gsdfgdsfsdg',
            },
          }),
      });

      es.onopen = () => {
        reject();

      }

      es.onerror = (err) => {
        try {
          expect(err.code).toBe(401);
          es.close();
          resolve();
        } catch (error) {
          es.close();
          reject(error);
        }
      };
    });
  });

  it("JWT using wrong secret", async () => {
    await new Promise((resolve, reject) => {
      const es = new EventSource(lobbiesSSE, {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            headers: {
              ...init.headers,
              Authorization: `Bearer ${app.jwt.sign({})}`,
            },
          }),
      });
      es.onopen = () => {
        es.close();
        reject();
      }

      es.onerror = (err) => {
        try {
          expect(err.code).toBe(401);
          es.close();
          resolve();
        } catch (error) {
          es.close();
          reject(error);
        }
      };
    });
  });

  it("success", async () => {
    await new Promise((resolve, reject) => {
      const es = new EventSource(lobbiesSSE, {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            headers: {
              ...init.headers,
              Authorization: `Bearer ${app.jwt.activity_sse.sign({})}`,
            },
          }),
      });

      es.onopen = () => {
        es.close();
        resolve();
      };

      es.onerror = () => {
        es.close();
        reject();
      }
    });
  });
});
