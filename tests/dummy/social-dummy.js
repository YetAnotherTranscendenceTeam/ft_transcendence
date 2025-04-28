import request from "superwstest";
import { apiURL, socialWS } from "../URLs";

export class SocialDummy {
  constructor(user) {
    this.id = user.account_id
    this.user = user;
  }

  async connect(welcome_data) {
    this.ws = request(socialWS).ws(`/notify?access_token=${this.user.jwt}`);
    this.expectEvent("welcome", welcome_data);
    return this.ws;
  }

  disconnect() {
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

  async newFriend(dummy) {
    let response = await request(apiURL)
      .post(`/social/requests/${dummy.user.account_id}`)
      .set('Authorization', `Bearer ${this.user.jwt}`);

    expect(response.statusCode).toBe(204);
    await this.expectEvent("recv_new_friend_request", { ...dummy.me(), sender: this.id });
    await dummy.expectEvent("recv_new_friend_request", { ...this.me(), sender: this.id });

    response = await request(apiURL)
      .post(`/social/requests/${this.id}`)
      .set('Authorization', `Bearer ${dummy.user.jwt}`);

    expect(response.statusCode).toBe(204);
    await this.expectEvent("recv_new_friend", { ...dummy.me(), status: {type: expect.any(String) } });
    await dummy.expectEvent("recv_new_friend", { ...this.me(), status: {type: expect.any(String) } });
  };

  async removeFriend(dummy) {
    return await request(apiURL)
      .delete(`/social/friends/${dummy.user.account_id}`)
      .set('Authorization', `Bearer ${this.user.jwt}`)
  };

  async block(dummy) {
    return await request(apiURL)
      .post(`/social/blocks/${dummy.user.account_id}`)
      .set('Authorization', `Bearer ${this.user.jwt}`)
  };

  async unblock(dummy) {
    return await request(apiURL)
      .delete(`/social/blocks/${dummy.user.account_id}`)
      .set('Authorization', `Bearer ${this.user.jwt}`)
  };

  me(options = {}) {
    if (options.id_only === true) {
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
      },
    };
    if (options.status) {
      me.status = options.status
    }
    return me;
  }

  reset() {
    this.close();
    this.connect();
  };

  send(payload) {
    this.ws.send(JSON.stringify(payload));
  };
};

export const emptyWelcome = {
  friends: [],
  pending: {
    sent: [],
    received: [],
  },
  blocked: [],
  self: { type: "online" },
};
