import Babact from "babact";
import './online.css'
import ModeButton from "./ModeButton";
import { useLobby } from "../../contexts/useLobby";
import useEscape from "../../hooks/useEscape";
import Button from "../../ui/Button";
import useGamemodes from "../../hooks/useGamemodes";
import { GameMode } from "yatt-lobbies";
import SegmentedControl from "../../ui/SegmentedControl";
import Separator from "../../ui/Separator";
import useMatchmakingUsers from "../../hooks/useMatchmackingUsers";

export default function SelectModeOverlay({
		isOpen,
		onClose,
	}: {
		isOpen: boolean,
		onClose: () => void,
		[key: string]: any
	}) {

	const {create, lobby } = useLobby();

	const { matchmakingUsers, refresh } = useMatchmakingUsers();

	const onSelect = (mode) => {
		if (lobby)
			lobby.changeMode(mode);
		else
			create(mode);
		onClose();
	};

	useEscape(isOpen, onClose);


	const gamemodes: GameMode[] = useGamemodes();

	Babact.useEffect(() => {
		if (isOpen) {
		  refresh();
		}
	  }, [isOpen]);

	if (!gamemodes) return <div>Loading...</div>;

	const [mode, setMode] = Babact.useState<string>('1v1');

	const ranked = gamemodes?.find(g => g.name === ("ranked_" + mode));
	const unranked = gamemodes?.find(g => g.name === ("unranked_" + mode));
	const custom = gamemodes?.find(g => g.name === ("custom_1v1"));
	const tournament = gamemodes?.find(g => g.name === ("tournament_1v1"));

	return <div
		className={`online-select-overlay flex flex-col items-center justify-center ${isOpen ? 'open' : ''}`}
		onClick={(e) => e.target === e.currentTarget && onClose()}
	>
		<Button onClick={onClose} className='close icon ghost'><i className="fa-solid fa-xmark"></i></Button>
		<div className='mode-buttons flex flex-col gap-4'>
			<div className='flex flex-col gap-4 items-center'>
				<SegmentedControl
					buttons={[
						{ label: '1v1', value: '1v1' },
						{ label: '2v2', value: '2v2' },
					]}
					onChange={(v) => {
						setMode(v);
					}}
					value={mode}
					className="w-fit"
				/>
				<div className='flex flex-row gap-4'>
					{ranked && <ModeButton gamemode={ranked} onSelect={onSelect} rating={matchmakingUsers.find((mu) => mu.gamemode === ranked.name)?.rating} />}
					{unranked && <ModeButton gamemode={unranked} onSelect={onSelect} />}
				</div>
			</div>
			<Separator className='w-full' />
			<div className='flex flex-row gap-4'>
				{custom && <ModeButton gamemode={custom} onSelect={onSelect} />}
				{tournament && <ModeButton gamemode={tournament} onSelect={onSelect} />}
			</div>
		</div>
	</div>
}