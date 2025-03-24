'use strict';

import EventManagerClass from "./EventManagerClass.js";
import WsErrorClass from "./WsError.js";
import WsCloseErrorClass from "./WsCloseError.js";

export const WsError = WsErrorClass;
export const WsCloseError = WsCloseErrorClass;
export const EventManager = EventManagerClass;
