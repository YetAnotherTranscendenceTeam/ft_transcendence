import Babact from "babact";
import useFetch from "./useFetch";
import config from "../config";

export interface Leaderboard {
	mode: string;
	rankings: {
		account_id: number;
		rating: number;
		username: string;
	}[]
}

export default function useLeaderboard() {

	const [leaderboards, setLeaderboards] = Babact.useState<Leaderboard[]>([]);
	const [updateAfter, setUpdateAfter] = Babact.useState<number | null>(null);
	const [canUpdate, setCanUpdate] = Babact.useState(false);

	const { ft_fetch, isLoading } = useFetch();

	const fetchLeaderboard = async () => {
		const response = await ft_fetch(`${config.API_URL}/matchmaking/leaderboards`);
		if (response) {
			setCanUpdate(false);
			setLeaderboards(response.leaderboards);
			setUpdateAfter(response.update_after);
		}
	};

	Babact.useEffect(() => {
		fetchLeaderboard();
	}, []);

	Babact.useEffect(() => {
		if (updateAfter === null)
			return;
	
		const now = Date.now();
		if (now > updateAfter) {
			setCanUpdate(true);
		} else {
			setTimeout(() => {
				setCanUpdate(true);
			}, updateAfter - now);
		}
	}, [updateAfter]);

	return { leaderboards, isLoading, canUpdate, update: fetchLeaderboard };
};
