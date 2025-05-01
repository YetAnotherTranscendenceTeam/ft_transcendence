"use strict";

import { EventSource } from 'eventsource';
import { online } from '../../utils/activityStatuses.js';

const eventName = "[LobbiesEventSource]";

export function lobbiesEventSource(fastify) {
  const url = "http://lobbies:3000/notify";
  const lobbiesEvents = new EventSource(url, {
    fetch: (input, init) =>
      fetch(input, {
        ...init,
        headers: {
          ...init.headers,
          Authorization: `Bearer ${fastify.jwt.activity_sse.sign({})}`,
        },
      }),
  });

  lobbiesEvents.onopen = () => {
    console.log(`${eventName}: Connected to ${url}`);
  }

  lobbiesEvents.onerror = (err) => {
    console.error(err);
  }

  lobbiesEvents.addEventListener('subscribed', (event) => {
    console.log(`${eventName}: Subscribed to lobbies notifications`);
  });

  // Event received on lobby update 
  lobbiesEvents.addEventListener('update', (event) => {
    const { players, gamemode, state } = JSON.parse(event.data);

    console.log("UPDATE:", players, gamemode);

    const status = {
      type: "inlobby",
      data: {
        player_ids: players,
        gamemode,
        state,
      },
    };
    players.forEach(id => {
      fastify.clients.get(id)?.setStatus(status);
    });
  });

  // Event received when a user leaves a lobby
  lobbiesEvents.addEventListener('leave', (event) => {
    console.log(event.data);
    fastify.clients.get(Number.parseInt(event.data))?.setStatus(online);
  });
};
