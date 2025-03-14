import Babact from "babact";
import './menu.css'
import { useAuth } from "../../contexts/useAuth";
import useEscape from "../../hooks/useEscape";
import Card from "../../ui/Card";
import { Link } from "babact-router-dom";
import Button from "../../ui/Button";
import PopHover from "../../ui/PopHover";
import { useLobby } from "../../contexts/useLobby";

export default function Menu({
		selected,
		setSelected
	}: {
		selected: string,
		setSelected: (selected: string) => void
	}){

	const {me} = useAuth();

	const { lobby } = useLobby();

	return <Card className={`menu left flex flex-col items-center justify-center gap-2`}>

			<Link to='/local' className='button ghost'>
				<i className="fa-solid fa-network-wired"></i><p>Local</p>
			</Link>

			<Button
				disabled={!me || (lobby && lobby.leader_account_id !== me.account_id)}
				className={`button ghost ${selected === 'online' ? 'active' : ''}`}
				onClick={() => setSelected(selected !== 'online' ? 'online' : null)}
			>
				<PopHover content={
					!me ? 'You must be logged in'
					: (lobby && lobby.leader_account_id !== me.account_id) ? 'You are not the lobby leader' : ''} className="flex items-center">
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