"use strict";

class jwtGenerator {
  instances = new Map();
  tokens = new Map();

  register(instance, namespace = "default") {
    this.instances.set(namespace, instance);
  }

  get(namespace = "default", payload) {
    const token = this.tokens.get(namespace);
    
    if (payload || !token || Date.now() > token.expire_at) {
      return this.#generate(namespace, payload || token?.payload);
    }
    return token.jwt;
  }

  #generate(namespace, payload) {
    payload ??= {};
    const jwt = this.instances.get(namespace).sign(payload, { expiresIn: '15m' });
    const expire_at = Date.now() + (14 * 60 * 1000);
    this.tokens.set(namespace, { jwt, expire_at, payload });
    return jwt;
  }
}

export default jwtGenerator;
