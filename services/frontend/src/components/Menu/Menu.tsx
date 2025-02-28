import Babact from "babact";
import './menu.css'
import { Link } from "babact-router-dom";
import Card from "../../ui/Card";
import PopHover from "../../ui/PopHover";
import { useAuth } from "../../contexts/useAuth";
import Button from "../../ui/Button";
import Settings from "../Settings/Settings";

export default function Menu() {

	const {me} = useAuth();

	const [isClosed, setIsClosed] = Babact.useState(false)

	return <div className='menu-container flex'>
		<Settings me={me} isOpen={isClosed} onClose={() => setIsClosed(false)} />
		<Card className={`menu right flex flex-col items-center justify-center h-full gap-4 ${isClosed ? 'closed' : ''}`}>

			<Link to='/local' className='button ghost'>
				<i className="fa-solid fa-network-wired"></i><p>Local</p>
			</Link>

			<Link to='/online' className={`button ghost ${!me ? 'disabled' : ''}`}>
				<PopHover content={!me ? 'You must be logged in' : ''} className="flex items-center">
					<i className="fa-solid fa-globe"></i><p>Online</p>
				</PopHover>
			</Link>

			<Link to='/tournament' className={`button ghost ${!me ? 'disabled' : ''}`}>
				<PopHover content={!me ? 'You must be logged in' : ''} className="flex items-center">
					<i className="fa-solid fa-users"></i><p>Tournament</p>
				</PopHover>
			</Link>

			<Button className={`button ghost ${isClosed ? 'active' : ''}`} onClick={() => setIsClosed(!isClosed)}>
				<i className="fa-solid fa-sliders"></i><p>Settings</p>
			</Button>
		</Card>
	</div>
}