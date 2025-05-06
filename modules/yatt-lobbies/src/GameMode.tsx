export enum GameModeType {
  RANKED = "ranked",
  UNRANKED = "unranked",
  CUSTOM = "custom",
  TOURNAMENT = "tournament",
}

export interface IMatchParameters {
  obstacles: boolean;
  powerups: boolean;
  time_limit: number;
  ball_speed: number;
  point_to_win: number;
  
};

export interface IGameMode {
  name: string;
  type: GameModeType;
  team_size: number;
  team_count: number;
  match_parameters: IMatchParameters;
}

export class GameMode implements IGameMode {
  name: string;
  type: GameModeType;
  team_size: number;
  team_count: number;
  match_parameters: IMatchParameters;
  constructor(
    name: string,
    { type, team_size, team_count, match_parameters }: { type: GameModeType; team_size: number; team_count: number, match_parameters: IMatchParameters }
  );
  constructor(oth: IGameMode);
  constructor(
    name: string | IGameMode,
    og?: { type: GameModeType; team_size: number; team_count: number, match_parameters: IMatchParameters }
  ) {
    if (typeof name === "string" && og) {
      this.name = name;
      this.type = og.type;
      this.team_size = og.team_size;
      this.team_count = og.team_count;
      this.match_parameters = og.match_parameters;
    } else {
      const oth = name as IGameMode;
      this.name = oth.name;
      this.type = oth.type;
      this.team_size = oth.team_size;
      this.team_count = oth.team_count;
      this.match_parameters = oth.match_parameters;
    }
  }

  toJSON(): IGameMode {
    return {
      name: this.name,
      type: this.type,
      team_size: this.team_size,
      team_count: this.team_count,
      match_parameters: this.match_parameters,
    };
  }

  getLobbyCapacity(): number {
    return this.type === GameModeType.TOURNAMENT || this.type === GameModeType.CUSTOM ? this.team_size * this.team_count : this.team_size;
  }

  getDisplayName(): string {
    return this.team_size + "v" + this.team_size;
  }

  getDisplayTypeName(): string {
    if (this.type === GameModeType.CUSTOM) return "Custom";
    if (this.type === GameModeType.TOURNAMENT) return "Clash";
    if (this.type === GameModeType.RANKED) return "Ranked";
    if (this.type === GameModeType.UNRANKED) return "Unranked";
    return "";
  }

}
