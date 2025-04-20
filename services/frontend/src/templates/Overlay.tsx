import Babact from "babact";
import LobbyCard from "../components/Lobby/LobbyCard";
import { useAuth } from "../contexts/useAuth";
import ProfileCard from "../components/Profile/ProfileCard";
import AuthCard from "../components/Auth/AuthCard";
import Settings from "../components/Settings/Settings";
import { useLobby } from "../contexts/useLobby";
import Menu from "../components/Menu/Menu";
import SelectModeOverlay from "../components/Online/SelectModeOverlay";
import './templates.css'

export default function Overlay({
		modal,
		hidden = false,
		children
	}: {
		modal?: any,
		hidden?: boolean,
		children?: any
	}) {

	const { me } = useAuth()
	const { lobby } = useLobby();

	const [selected, setSelected] = Babact.useState<string>(null);

	Babact.useEffect(() => {
		if (hidden) {
			setSelected(null);
		}
	}, [hidden]);

	return <div className={`overlay flex ${hidden ? 'hidden' : ''}`} key='overlay'>
			<Settings
				me={me}
				isOpen={selected === 'settings'}
				onClose={() => setSelected(null)}
			/>
			<SelectModeOverlay
				isOpen={selected === 'online'}
				onClose={() => setSelected(null)}
			/>
			<div className='template-content'>
				{children}
			</div>
			{ modal &&
				<div className='template-modal'>
					{modal}
				</div>
			}
			<header className='header flex gap-4 items-center justify-center' key='header'>
				<Menu
					selected={selected}
					setSelected={setSelected}
				/>
			</header>
			<aside className='aside flex flex-col gap-4' key='aside'>
				{lobby && <LobbyCard/>}
				{me ? <ProfileCard me={me}/> : <AuthCard/>}
			</aside>
		</div>
}