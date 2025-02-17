'use strict';

import { hashPassword, verifyPassword } from "./crypt/crypt.js";
import fetch from "./http/fetch.js";
import HttpErrorClass from "./http/HttpError.js";
import reponseBodyObjects from "./schemas/objects/reponse-body.js";

import credentialsProperties from "./schemas/properties/credentials.js";
import responseBodyProperties from "./schemas/properties/reponse-body.js";
import sqlProperties from "./schemas/properties/sql.js";
import setUpSwagger from "./swagger/setup.js";

const YATT = {
    fetch,
    setUpSwagger,
    crypto: {
        hashPassword,
        verifyPassword
    }
};

export default YATT;

export const HttpError = HttpErrorClass;

export const properties = {
    ...credentialsProperties,
    ...sqlProperties,
    ...responseBodyProperties
}

export const objects = {
    ...reponseBodyObjects
}
