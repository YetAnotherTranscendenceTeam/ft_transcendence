"use strict";

class jwtGenerator {
  instances = new Map();
  tokens = new Map();

  register(instance, namespace = "default") {
    this.instances.set(namespace, instance);
  }

  get(namespace = "default") {
    const token = this.tokens.get(namespace);
    if (!token || Date.now() < token.expire_at) {
      return this.#generate(namespace);
    }
    return token.jwt;
  }

  #generate(namespace) {
    const jwt = this.instances.get(namespace).sign({}, { expireIn: '15m' });
    const expire_at = new Date(Date.now() + 14 * 60 * 1000);
    this.tokens.set(namespace, { jwt, expire_at });
    return jwt;
  }
}

export default jwtGenerator;
