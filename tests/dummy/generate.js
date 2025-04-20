"use strict";

import crypto from "crypto";

export function randomEmail(prefix = "test") {
    return `${prefix}-${crypto.randomBytes(10).toString("hex")}@jest.com`;
};

export function randomId() {
    return  Math.floor(Math.random() * 42000000);
};

export function randomGoogleUser() {
    return {
        account_id: null,
        email: randomEmail("google"),
        google_id: randomId(),
    }
};

export function randomFortytwoUser() {
    return {
        account_id: null,
        email: randomEmail("fortytwo"),
        intra_user_id: randomId(),
    }
};
