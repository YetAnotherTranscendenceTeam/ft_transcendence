export enum GameModeType {
  RANKED = "ranked",
  UNRANKED = "unranked",
  CUSTOM = "custom",
}

export interface IGameMode {
  name: string;
  type: GameModeType;
  team_size: number;
  team_count: number;
}

export class GameMode implements IGameMode {
  name: string;
  type: GameModeType;
  team_size: number;
  team_count: number;
  constructor(
    name: string,
    { type, team_size, team_count }: { type: GameModeType; team_size: number; team_count: number }
  );
  constructor(oth: IGameMode);
  constructor(
    name: string | IGameMode,
    og?: { type: GameModeType; team_size: number; team_count: number }
  ) {
    if (typeof name === "string" && og) {
      this.name = name;
      this.type = og.type;
      this.team_size = og.team_size;
      this.team_count = og.team_count;
    } else {
      const oth = name as IGameMode;
      this.name = oth.name;
      this.type = oth.type;
      this.team_size = oth.team_size;
      this.team_count = oth.team_count;
    }
  }

  toJSON(): IGameMode {
    return {
      name: this.name,
      type: this.type,
      team_size: this.team_size,
      team_count: this.team_count,
    };
  }

  getLobbyCapacity(): number {
    return this.type === GameModeType.RANKED ? this.team_size : this.team_size * this.team_count;
  }

  getDisplayName(): string {
    return this.team_size + "v" + this.team_size;
  }
}
