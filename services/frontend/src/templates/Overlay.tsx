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
		children
	}: {
		children?: any
	}) {

	const { me } = useAuth()
	const { lobby } = useLobby();

	const [selected, setSelected] = Babact.useState(null);

	return <div className='flex'>
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
			<aside className='aside flex flex-col gap-4'>
				{lobby && <LobbyCard/>}
				{me ? <ProfileCard me={me}/> : <AuthCard/>}
				<Menu
					selected={selected}
					setSelected={setSelected}
				/>
			</aside>
		</div>
}