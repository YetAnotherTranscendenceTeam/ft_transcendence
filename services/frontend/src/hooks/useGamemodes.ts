import useEffect from "babact/dist/hooks/useEffect";
import useFetch from "./useFetch";
import Babact from "babact";
import config from "../config";
import { GameMode } from "yatt-lobbies";

export default function useGamemodes() {

	const { ft_fetch } = useFetch();

	const [gamemodes, setGamemodes] = Babact.useState<GameMode[]>(null);

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

	useEffect(() => {
		fetchGamemodes();
	}, []);

	return gamemodes;
}