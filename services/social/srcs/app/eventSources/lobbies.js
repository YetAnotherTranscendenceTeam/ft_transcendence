"use strict";

import { EventSource } from 'eventsource';
import { online, StatusTypes } from '../../utils/activityStatuses.js';

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
    // console.error(err);
  }

  lobbiesEvents.addEventListener('subscribed', (event) => {
    console.log(`${eventName}: Subscribed to lobbies notifications`);
  });

  // Event received on lobby update 
  lobbiesEvents.addEventListener('lobby_update', (event) => {
    const { players, gamemode, state } = JSON.parse(event.data);

    const status = {
      type: StatusTypes.INLOBBY,
      data: {
        player_ids: players,
        gamemode,
        state,
      },
    };

    players.forEach(id => {
      const client = fastify.clients.get(id);
      if (!client) return;

      if (![StatusTypes.INGAME, StatusTypes.INTOURNAMENT].includes(client.customStatus?.type)) {
        client.setStatus(status);
      }
    });
  });

  // Event received when a user leaves a lobby
  lobbiesEvents.addEventListener('lobby_leave', (event) => {

    const client = fastify.clients.get(Number.parseInt(event.data));
    if (!client) return;

    if (![StatusTypes.INGAME, StatusTypes.INTOURNAMENT].includes(client.customStatus?.type)) {
      client.setStatus(online);
    }
  });

  // Event received on a tournament update
  lobbiesEvents.addEventListener('tournament_update', (event) => {
    const data = JSON.parse(event.data);
    
    // Prepare status
    const status = data.active
      ? { type: StatusTypes.INTOURNAMENT, data }
      : online;
    
    // Send to every player in the tournament
    data.players.forEach(id => {
      const client = fastify.clients.get(id);
      if (!client) return;
  
      if (client.customStatus?.type !== StatusTypes.INGAME) {
        client.setStatus(status);
      }
    });
  });

  const MatchState = {
    RESERVED: 0,
    PLAYING: 1,
    DONE: 2,
    CANCELLED: 3,
  };

  // Event received on a match update
  lobbiesEvents.addEventListener('match_update', (event) => {
    const data = JSON.parse(event.data);

    // Prepare status
    const status = data.state === MatchState.PLAYING
      ? { type: "ingame", data }
      : online ;

    // Send to each player in the match
    data.players.forEach(id => {
      fastify.clients.get(id)?.setStatus(status);
    });
  });
};
