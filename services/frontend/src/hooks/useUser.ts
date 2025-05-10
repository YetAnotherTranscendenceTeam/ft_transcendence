import Babact from "babact";
import { User } from "./useUsers";
import useFetch from "./useFetch";
import config from "../config";

export type MatchCount = {
	name: string,
	count: number,
	color: string,
}

export interface MatchMackingUser {
	gamemode: string,
	rating: number,
	match_count: number,
	created_at: string,
	updated_at: string,
	elo_datapoints: number[],
}

export type EloDataPoints = {
	'1v1'?: number[],
	'2v2'?: number[],
}

const getColor = (name: string) => {
	switch (name) {
		case 'ranked':
			return 'rgb(75, 162, 255)';
		case 'unranked':
			return 'rgb(247, 94, 255)';
		case 'custom':
			return 'rgb(50, 255, 115)';
		case 'tournament':
			return 'rgb(255, 115, 50)';
		default:
			return 'rgb(255, 255, 255)';
	}

}

export default function useUser(account_id: number) {

	const [user, setUser] = Babact.useState<User>(null);
	const [gamemodes, setGamemodes] = Babact.useState<MatchCount[]>(null);
	const [elos, setElos] = Babact.useState<EloDataPoints>(null);

	const setMatchCount = (users: MatchMackingUser[]) => {
		const stats = users.map((user) => ({
			name: user.gamemode.split('_')[0] ?? '',
			count: user.match_count,
			color: ''
		})).reduce((acc: MatchCount, { name, count }) => {
			acc[name] = acc[name] || { name, count: 0, color: getColor(name) };
			acc[name].count += count;
			return acc;
		}, {} as MatchCount);

		const newGamemodes = Object.keys(stats).map((key) => ({
			name: stats[key].name,
			count: stats[key].count,
			color: stats[key].color,
		}))
		setGamemodes(newGamemodes);
	}

	const { ft_fetch, isLoading } = useFetch();

	const fetchUser = async () => {
		if (!account_id) return;
		const response = await ft_fetch(`${config.API_URL}/users/${account_id}`);
		if (response) {
			setUser(new User(response, ft_fetch));
			setMatchCount(response.matchmaking_users);
			const ranked1v1 = response.matchmaking_users.find((user: MatchMackingUser) => user.gamemode === 'ranked_1v1')?.elo_datapoints;
			const ranked2v2 = response.matchmaking_users.find((user: MatchMackingUser) => user.gamemode === 'ranked_2v2')?.elo_datapoints;
			const elos = {
				'1v1': ranked1v1 ?? [],
				'2v2': ranked2v2 ?? [],
			}
			console.log('elos', elos);
			setElos(elos);
		}
	}

	Babact.useEffect(() => {
		fetchUser();
	}, [account_id]);

	return {
		user,
		loading: isLoading,
		gamemodes,
		elos,
	}


}