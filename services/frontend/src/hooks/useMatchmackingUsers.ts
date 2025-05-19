import useFetch from "./useFetch";
import config from "../config";
import { useAuth } from "../contexts/useAuth";
import Babact from "babact";

export interface ImatchmakingUser {
  account_id: number,
  gamemode: string,
  rating: number,
  match_count: number,
  created_at: string,
  updated_at: string,
};

export default function useMatchmakingUsers() {
  const { ft_fetch } = useFetch();
  const { me } = useAuth();

  const [matchmakingUsers, setMatchmakingUsers] = Babact.useState<ImatchmakingUser[]>([]);

  const fetchMatchmakingUsers = async () => {
    const response = await ft_fetch(`${config.API_URL}/matchmaking/users/${me.account_id}`);
    if (response) {
      setMatchmakingUsers(response.matchmaking_users);
    }
  };

  return { matchmakingUsers, refresh: fetchMatchmakingUsers};
};
