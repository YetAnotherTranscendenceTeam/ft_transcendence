import Babact from "babact";
import './menu.css'
import { Link } from "babact-router-dom";
import Card from "../../ui/Card";
import PopHover from "../../ui/PopHover";
import { useAuth } from "../../contexts/useAuth";
import Button from "../../ui/Button";
import Settings from "../Settings/Settings";
import SelectModeOverlay from "../Online/SelectModeOverlay";
import useEscape from "../../hooks/useEscape";

export default function Menu() {

	const {me} = useAuth();

	const [selected, setSelected] = Babact.useState(null)

	const isClosed = selected !== null;

	useEscape(isClosed, () => setSelected(null));

	return <div className='menu-container flex'>
		<Settings me={me} isOpen={selected === 'settings'} onClose={() => setSelected(null)} />
		<SelectModeOverlay isOpen={selected === 'online'} onClose={() => setSelected(null)} />
		<Card className={`menu right flex flex-col items-center justify-center h-full gap-4 ${isClosed ? 'closed' : ''}`}>

			<Link to='/local' className='button ghost'>
				<i className="fa-solid fa-network-wired"></i><p>Local</p>
			</Link>

			<Button
				disabled={!me}
				className={`button ghost ${selected === 'online' ? 'active' : ''}`}
				onClick={() => setSelected(selected !== 'online' ? 'online' : null)}
			>
				<PopHover content={!me ? 'You must be logged in' : ''} className="flex items-center">
					<i className="fa-solid fa-globe"></i><p>Online</p>
				</PopHover>
			</Button>

			<Link to='/tournament' className={`button ghost ${!me ? 'disabled' : ''}`}>
				<PopHover content={!me ? 'You must be logged in' : ''} className="flex items-center">
					<i className="fa-solid fa-users"></i><p>Tournament</p>
				</PopHover>
			</Link>

			<Button
				className={`button ghost ${selected === 'settings' ? 'active' : ''}`}
				onClick={() => setSelected(selected !== 'settings' ? 'settings' : null)}
			>
				<i className="fa-solid fa-sliders"></i><p>Settings</p>
			</Button>
		</Card>
	</div>
}