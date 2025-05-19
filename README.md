# ft_transcendence - Yet Another Pong
This project is a web application offering a multiplayer online version of Atari's arcade game `Pong` (1972), integrated as modern video game plateform.

## Features

- Pong game
	- Local gameplay
	- Advanced 3D Graphics

- User account
	-	Remote authentication
		- Google Sign in
		- 42Intra
	- Two factor authentication
	- Unique username
	- Avatar upload

- Online gameplay
	- 1v1 / 2v2
	- Obstacles
	- Power-ups
		- Multiball
		- Magnet
		- Ice rink
	- Spectating mode

- Ranked games
	- Matchmaking rating
	- Matchmaking queue
	- Leaderboard

- Custom games
	- Points to win
	- Ball speed
	- Obscacles on/off
	- Power-ups selection

- Clashes
	- 3-16 teams competition
	- Dynamic tournament tree
	- All game modes
	- All game customizations
	- Confettis

- Social pannel
	- Friend system
	- Live activity status
	- Lobby invitations

- User profile
	- Game history
	- MMR evoluation graph
	- Game mode pie chart

# Setup

**This project requires the docker engine to be running, make sure you have it correctly setup before trying to deploy this project.**

Clone the project

```sh
git clone git@github.com:YetAnotherTranscendenceTeam/ft_transcendence.git
```

Navigate into it
```sh
cd ft_transcendence
```

### Developper setup

This environment allows for easy modifications to the project, any modification to any file **that is not a module** will cause the dependant services to restart automatically.



Start the project

```sh
make dev
```

### Production setup

Setup your environment, you can use the environment generation tool with:

```sh
bash ./env-generator.sh <DOMAIN_NAME>
```

<!--
TODO: IMPROVE THIS!!!
-->
**You should tweak the .env file yourself with the corresponding parameters.** The [.env.template](./.env.template) file can help you understand what each variable corresponds to.

Start the project
```sh
make prod
```


## Services

![Services Communications Graph](./documentation/services-communications.png "Services Communications Graph")

### API Nginx

This service is a webserver acting as the API gateway. Every request received is forwarded to the appropriate service based on the requested URL.

### Credentials

This service manages the account database, holding every account credentials secure on an internal network. Other services use it to validate an account creation or an authentication request from the client.

### Registration

This service handles password based account creation.

### Password-auth

This service handles authentication requests using a password based account.

### Google-auth

This service handles authentication requests using the Google Sign in.

### Fortytwo-auth

This service handles authentication requests using the Google Sign in.

### 2FA

This service handles multi authentication verification

### Token-manager

This service delivers and refresh `Json Web Tokens` to authenticated users, providing them a way to proove their identity to other services.

### Profiles

This service manages the profile database. Other services use it to resolve public profile information associated with an account.

### Settings

This service handles every account modification request, making sure requested changes are forwarded to the associated service.

### Avatars

This service handles users profile pictures, allowing them to retreive all pictures available to them and to upload custom ones.

### Social

This service handles users relationships. It broadcast live activity status to users friends and allow them to send/receive game invitations through notifications.

### Spectator

This service allows users to spectate online games.

### Matchmaking

This services handles matching lobbies with similar skill levels, it uses a custom rating to evaluate a player's skills. It also handles tournaments and automatically balances tournaments using player rating. The match history is also stored here. 

### Lobbies

This services allows player to play with their friends by inviting them to their lobby.
This is also the only entrypoint to the matchmaking queue.

### Pong

This is the game server, it receives game reservations from the matchmaking service, players connect here to play the game. It also sends the match results back to matchmaking to update the backend match entries and tournaments.

### CDN Nginx

This service is a webserver serving assets.

### CDN API

This service handles the `CDN` content. It allows other services to upload or delete ressources.
