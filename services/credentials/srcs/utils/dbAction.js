"user strict";

import db from "../app/database.js";

const get_by_id = db.prepare(`
  SELECT * FROM accounts WHERE account_id = ?
`);
export function getById(account_id) {
  return get_by_id.get(account_id);
}


const get_otp_methods = db.prepare(`
  SELECT method FROM otp_methods WHERE account_id = ?
`)
export function getOTPMethods(account_id) {
  return get_otp_methods.all(account_id);
}


const update_email = db.prepare(`
    UPDATE accounts SET email = ? WHERE account_id = ?
  `);
export function updateEmail(email, account_id) {
  return update_email.run(email, account_id)
}


const update_password = db.prepare(`
    UPDATE password_auth SET hash = ?, salt = ? WHERE account_id = ?
`);
export function updatePassword(hash, salt, account_id) {
  return update_password.run(hash, salt, account_id);
}

export const add_otp_method = db.prepare(`
  INSERT INTO otp_methods (account_id, method) VALUES (?, ?) RETURNING *
`);

export function addOTPMethod(account_id, method) {
  return add_otp_method.get(account_id, method);
}


export const remove_otp_method = db.prepare(`
  DELETE FROM otp_methods WHERE account_id = ? AND method = ?
`);
export function removeOTPMethod(account_id, method) {
  return remove_otp_method.run(account_id, method);
}
