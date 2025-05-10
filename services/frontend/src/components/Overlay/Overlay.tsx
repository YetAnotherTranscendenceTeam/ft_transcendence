import Babact from "babact";
import LobbyCard from "../Lobby/LobbyCard";
import { useAuth } from "../../contexts/useAuth";
import ProfileCard from "../Profile/ProfileCard";
import AuthCard from "../Auth/AuthCard";
import Settings from "../Settings/Settings";
import { useLobby } from "../../contexts/useLobby";
import Menu from "./Menu";
import SelectModeOverlay from "../Online/SelectModeOverlay";
import './overlay.css'
import TournamentCard from "../Tournament/TournamentCard";

export default function Overlay({
		hidden = false,
		children
	}: {
		hidden?: boolean,
		children?: any,
		[key: string]: any
	}) {

	const { me } = useAuth()
	const { lobby } = useLobby();

	const [selected, setSelected] = Babact.useState<string>(null);

	Babact.useEffect(() => {
		if (hidden) {
			setSelected(null);
		}
	}, [hidden]);

	Babact.useEffect(() => {
		console.log('overlay mounted');
		return () => {
			console.log('overlay unmounted');
		}
	}, [])

	return <div className={`overlay flex ${hidden ? 'hidden' : ''}`} key='overlay'>
			<Settings
				key='settings'
				me={me}
				isOpen={selected === 'settings'}
				onClose={() => setSelected(null)}
			/>
			<SelectModeOverlay
				key='select-mode'
				isOpen={selected === 'online'}
				onClose={() => setSelected(null)}
			/>
			<div className='template-content'>
				{children}
			</div>
			<header className='header flex gap-4 items-center justify-center' key='header'>
				<Menu
					selected={selected}
					setSelected={setSelected}
				/>
			</header>
			<aside className='aside flex' key='aside'>
				<div className='aside-content flex flex-col gap-4' key='aside-content'>
					{me && <TournamentCard/>}
					{me && lobby && <LobbyCard/>}
					{me ? <ProfileCard me={me} key='profile-card'/> : <AuthCard/>}
				</div>
			</aside>
		</div>
}