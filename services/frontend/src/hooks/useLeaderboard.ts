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
	const [updateTimeout, setUpdateTimeout] = Babact.useState<number>(null);

	const { ft_fetch, isLoading } = useFetch();

	const fetchLeaderboard = async () => {
		const response = await ft_fetch(`${config.API_URL}/matchmaking/leaderboards`);
		if (response) {
			setLeaderboards(response.leaderboards);
			setUpdateTimeout(response.update_after);
		}
	};

	Babact.useEffect(() => {
		fetchLeaderboard();
	}, []);

	Babact.useEffect(() => {
		if (updateTimeout) {

			const timer = setTimeout(() => {
				setUpdateTimeout(null);
			}, updateTimeout - Date.now());

			return () => clearTimeout(timer);
		}
	}, [updateTimeout]);

	return { leaderboards, isLoading, canUpdate: !updateTimeout, update: fetchLeaderboard };
};
