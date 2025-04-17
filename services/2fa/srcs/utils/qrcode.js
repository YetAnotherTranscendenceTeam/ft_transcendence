export function getQRCode(secret, options = {}) {
  const {
    email = "transcendence", 
    algorithm = "SHA1", 
    digits = 6, 
    perdiod = 30
  } = options;

  return `otpauth://totp/${email}?secret=${secret}&issuer=YATT&algorithm=${algorithm}&digits=${digits}&period=${perdiod}`;
}
