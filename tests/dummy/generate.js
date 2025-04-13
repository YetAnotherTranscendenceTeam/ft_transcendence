"use strict";

import crypto from "crypto";

export const randomEmail = `password.test.js-${crypto.randomBytes(10).toString("hex")}@jest.com`;
