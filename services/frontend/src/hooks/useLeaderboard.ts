import Babact from "babact";
import useFetch from "./useFetch";
import config from "../config";
import { IUser } from "./useUsers";

export interface Leaderboard {
	mode: string;
	rankings: {
		account_id: number;
		rating: number;
		profile: IUser;
	}[]
}


export default function useLeaderboard() {

	const [leaderboards, setLeaderboards] = Babact.useState<Leaderboard[]>([]);
	const { ft_fetch, isLoading } = useFetch();

	const fetchLeaderboard = async () => {
		const response = await ft_fetch(`${config.API_URL}/matchmaking/leaderboards`);
		if (response) {
			console.log("response", response);
			setLeaderboards(response);
		}
	}

	Babact.useEffect(() => {
		fetchLeaderboard();
	}, []);

	return {leaderboards, isLoading, refresh: fetchLeaderboard};

}