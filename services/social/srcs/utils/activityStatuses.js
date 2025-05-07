"use strict";

export const StatusTypes = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  INACTIVE: 'inactive',
  INLOBBY: 'inlobby',
  INTOURNAMENT: 'intournament',
  INGAME: 'ingame',
};

export const inactive = { type: StatusTypes.INACTIVE };
export const offline = { type: StatusTypes.OFFLINE };
export const online = { type: StatusTypes.ONLINE };
