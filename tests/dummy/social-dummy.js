import request from "superwstest";
import { apiURL, socialWS } from "../URLs";

export class SocialDummy {
  constructor(user) {
    this.id = user.account_id
    this.user = user;
  }

  async connect() {
    this.ws = request(socialWS).ws(`/notify?access_token=${this.user.jwt}`);
    return this.ws;
  }

  disconect() {
    this.ws.send(JSON.stringify({ event: "goodbye" })).expectClosed();
  }

  async expectEvent(event, data) {
    return this.ws.expectJson(message => {
      // console.error(message);
      expect(message.event).toEqual(event)
      if (data) {
        expect(message.data).toEqual(data);
      }
    })
  }

  async sendFriendRequest(dummy) {
    return await request(apiURL)
      .post(`/social/requests/${dummy.user.account_id}`)
      .set('Authorization', `Bearer ${this.user.jwt}`)
  };

  async cancelFriendRequest(dummy) {
    return await request(apiURL)
      .delete(`/social/requests/${dummy.user.account_id}`)
      .set('Authorization', `Bearer ${this.user.jwt}`)
  };

  me(options = {}) {
    if (options.id_only) {
      return { account_id: this.account_id };
    }
    const me = {
      account_id: this.user.account_id,
      profile: {
        account_id: this.user.account_id,
        avatar: this.user.profile.avatar,
        username: this.user.profile.username,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      }
    };
    if (options.status) {
      me.status = options.status
    }
    return me;
  }
}
