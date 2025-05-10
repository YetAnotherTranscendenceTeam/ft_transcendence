'use strict';

import { hashPassword, verifyPassword } from "./crypt/crypt.js";
import fetch from "./http/fetch.js";
import HttpErrorClass from "./http/HttpError.js";
import patchBodyToSql from "./http/patchBodyToSql.js";
import filterToSql from "./http/filterToSql.js";
import orderToSql from "./http/orderToSql.js";
import reponseBodyObjects from "./schemas/objects/reponse-body.js";

import credentialsProperties from "./schemas/properties/credentials.js";
import tokenProperties from "./schemas/properties/jwt.js";
import profilesProperties from "./schemas/properties/profiles.js";
import responseBodyProperties from "./schemas/properties/reponse-body.js";
import sqlProperties from "./schemas/properties/sql.js";
import { setRefreshTokenCookie } from "./http/cookies.js";

const YATT = {
    fetch,
    crypto: {
        hashPassword,
        verifyPassword
    },
    patchBodyToSql,
    filterToSql,
    orderToSql,
    setRefreshTokenCookie,
};

export default YATT;

export const HttpError = HttpErrorClass;

export const properties = {
    ...credentialsProperties,
    ...sqlProperties,
    ...responseBodyProperties,
    ...tokenProperties,
    ...profilesProperties
}

export const objects = {
    ...reponseBodyObjects
}
