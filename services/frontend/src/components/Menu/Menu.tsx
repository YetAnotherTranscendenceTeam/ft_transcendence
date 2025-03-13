import Babact from "babact";
import './menu.css'
import { useAuth } from "../../contexts/useAuth";
import useEscape from "../../hooks/useEscape";
import Card from "../../ui/Card";
import { Link } from "babact-router-dom";
import Button from "../../ui/Button";
import PopHover from "../../ui/PopHover";

export default function Menu({
		selected,
		setSelected
	}: {
		selected: string,
		setSelected: (selected: string) => void
	}){

	const {me} = useAuth();

	return <Card className={`menu left flex flex-col items-center justify-center gap-2`}>

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

			<Button
				className={`button ghost ${selected === 'settings' ? 'active' : ''}`}
				onClick={() => setSelected(selected !== 'settings' ? 'settings' : null)}
			>
				<i className="fa-solid fa-sliders"></i><p>Settings</p>
			</Button>
		</Card>
}