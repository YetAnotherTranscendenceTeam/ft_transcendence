"use strict";

export function generateOTPAuth(secret, options = {}) {
  const {
    email = "transcendence", 
    algorithm = "SHA1", 
    digits = 6, 
    period = 30
  } = options;

  return `otpauth://totp/${email}?secret=${secret}&issuer=YATT&algorithm=${algorithm}&digits=${digits}&period=${period}`;
}
