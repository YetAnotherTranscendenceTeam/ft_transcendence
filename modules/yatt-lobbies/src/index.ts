import { IGameMode, GameMode, GameModeType } from './GameMode';
import { IPlayer, LobbyStateType } from './Lobby';
export { IGameMode, GameMode, GameModeType, LobbyStateType, IPlayer };
export { ILobbyState, ILobby, Lobby } from './Lobby';

export function removePlayer(players: IPlayer[], mode: IGameMode, rm_index: number): IPlayer[] {
    let team = rm_index % mode.team_size;
    let new_players = [];
    for (let i = 0; i < players.length; i++) {
      if (i < rm_index) new_players.push(players[i]);
      else if (i % mode.team_size == team && i + mode.team_size < players.length) {
        new_players.push(players[i + mode.team_size]);
      }
      else if (i % mode.team_size != team)
        new_players.push(players[i])
    }
	return new_players;
}
