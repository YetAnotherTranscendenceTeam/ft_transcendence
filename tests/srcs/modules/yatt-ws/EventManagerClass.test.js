import { EventManager } from "yatt-ws";

class fakeSocket {
  received = [];

  send(payload) {
    this.received.push(JSON.parse(payload));
  }
}

describe('EventManager Class', () => {
  let eventManager;
  let mockSocket;

  beforeEach(() => {
    eventManager = new EventManager();
    mockSocket = new fakeSocket();
  });

  describe('register', () => {
    it('should register an event with its configuration', () => {
      const eventId = 'testEvent';
      const configuration = { handler: () => { console.log("truc") } };

      eventManager.register(eventId, configuration);

      expect(eventManager.events.get(eventId)).toBe(configuration);
    });
  });

  const invalidMessage = {
    event: "error",
    data: expect.objectContaining({
      code: "INVALID_MESSAGE",
      message: expect.any(String),
    })
  };

  const invalidEvent = {
    event: "error",
    data: expect.objectContaining({
      code: "INVALID_EVENT",
      message: expect.any(String),
    })
  };

  const unknownEvent = {
    event: "error",
    data: expect.objectContaining({
      code: "UNKNOWN_EVENT",
      message: expect.any(String),
    })
  };

  describe('receive bad', () => {
    it('empty message', () => {
      const payload = {};

      eventManager.receive(mockSocket, payload);

      expect(mockSocket.received).toEqual([invalidMessage]);
    });

    it('no event key', () => {
      const payload = { nope: 'testEven' };

      eventManager.receive(mockSocket, payload);

      expect(mockSocket.received).toEqual([invalidMessage]);
    });

    it('unkwown event', () => {
      const payload = { event: "doesnotexist" };

      eventManager.receive(mockSocket, payload);

      expect(mockSocket.received).toEqual([unknownEvent]);
    });

  });

  describe('valid events', () => {
    it('no schema', () => {
      eventManager.register("test", {
        handler: (socket) => { socket.send(JSON.stringify("result")) },
      })

      const payload = { event: "test" };

      eventManager.receive(mockSocket, payload);

      expect(mockSocket.received).toEqual(["result"]);
    });

    it('shema no data', () => {
      eventManager.register("test", {
        handler: (socket) => { socket.send(JSON.stringify("result")) },
        schema: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["online", "ingame", "inlobby"],
            },
            data: {
              type: "object"
            },
          },
          required: ["type"],
        }
      })

      const payload = { event: "test" };

      eventManager.receive(mockSocket, payload);

      expect(mockSocket.received).toEqual([invalidEvent]);
    });

    it('shema bad data', () => {
      eventManager.register("test", {
        handler: (socket) => { socket.send(JSON.stringify("result")) },
        schema: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["online", "ingame", "inlobby"],
            },
            data: {
              type: "object"
            },
          },
          required: ["type"],
        }
      })

      const payload = { event: "test", data: { nope: "??" } };

      eventManager.receive(mockSocket, payload);

      expect(mockSocket.received).toEqual([invalidEvent]);
    });

    it('shema valid data', () => {
      eventManager.register("test", {
        handler: (socket) => { socket.send(JSON.stringify("result")) },
        schema: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["online", "ingame", "inlobby"],
            },
            data: {
              type: "object"
            },
          },
          required: ["type"],
        }
      })

      const payload = { event: "test", data: { type: "online" } };

      eventManager.receive(mockSocket, payload);

      expect(mockSocket.received).toEqual(["result"]);
    });
  });
});
