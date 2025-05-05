import Babact from "babact";
import { Match } from "./useTournament";
import useFetch from "./useFetch";
import config from "../config";


export default function useMatches(account_id: number, pageSize: number = 30) {

	const [matches, setMatches] = Babact.useState<Match[]>([]);
	const [page, setPage] = Babact.useState(0);

	const { ft_fetch, isLoading }  = useFetch();

	const fetchMatches = async () => {
		const response = ft_fetch(`${config.API_URL}/matchmaking/users/${account_id}/matches?offset=${page * pageSize}&limit=${pageSize}`, {}, {
			show_error: true,
			success_message: 'Matches loaded',
		});
		if (response) {
			console.log('Matches', response);
		}
	}

	Babact.useEffect(() => {
		fetchMatches();
	}, [page]);

	return {
		matches,
		page,
		setPage,
		isLoading
	}
}