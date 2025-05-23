import useFetch from "./useFetch";
import Babact from "babact";
import config from "../config";
import { GameMode } from "yatt-lobbies";
import { useAuth } from "../contexts/useAuth";

export default function useGamemodes() {

	const { ft_fetch } = useFetch();

	const [gamemodes, setGamemodes] = Babact.useState<GameMode[]>(null);
	const { me } = useAuth();

	const fetchGamemodes = async () => {
		const res = await ft_fetch(`${config.API_URL}/lobbies/gamemodes`);
		const gamemodes = [];
		if (res) {
			Object.keys(res).forEach((key) => {
				gamemodes.push(new GameMode(res[key]));
			});
		}
		setGamemodes(gamemodes);
	}

	Babact.useEffect(() => {
		if (me)
			fetchGamemodes();
	}, [me?.account_id]);

	return gamemodes;
}