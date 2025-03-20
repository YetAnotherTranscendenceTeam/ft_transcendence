export const inactive = { type: "inactive" };
export const offline = { type: "offline" };
export const online = { type: "online" };

const allowedTypes = ["online", "ingame", "inlobby"];

const allowedKeys = ["type", "data"];

export function parseUserStatus(payload) {
  if (!payload) {
    throw new WsError.InvalidEvent(payload);
  }
  Object.keys(payload).forEach(key => {
    if (!allowedKeys.includes(key)) {
      throw new WsError.InvalidEvent(payload);
    }
  });
  if (!allowedTypes.includes(payload.type)) {
    throw new WsError.InvalidEvent(payload);
  }
  return payload;
}
