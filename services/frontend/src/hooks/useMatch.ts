import Babact from "babact";
import { Match } from "./useMatches";
import useFetch from "./useFetch";
import config from "../config";



export default function useMatch(match_id: number) {

	const [match, setMatch] = Babact.useState<Match>(null);
	const { ft_fetch, isLoading } = useFetch();

	const fetchMatch = async () => {
		const response = await ft_fetch(`${config.API_URL}/matchmaking/matches/${match_id}`);
		if (response) {
			setMatch(new Match(response, 0));
		}
	}

	Babact.useEffect(() => {
		if (match_id) {
			fetchMatch();
		}
	}, [match_id]);

	return {
		match,
		isLoading
	}

}