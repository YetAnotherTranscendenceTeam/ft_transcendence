export const inactive = { type: "inactive" };
export const offline = { type: "offline" };
export const online = { type: "online" };

const allowedTypes = ['online', 'ingame', 'inlobby'];

const allowedKeys = ["type", "data"];

export function parseUserStatus(payload) {
  if (!payload) {
    throw Error("invalid event");
  }
  Object.keys(payload).forEach(key => {
    if (!allowedKeys.includes(key)) {
      throw Error("invalid status event");
    }
  });
  if (!allowedTypes.includes(payload.type)) {
    throw Error("invalid status type");
  }
  return { type: payload.type, data: payload.data };
}