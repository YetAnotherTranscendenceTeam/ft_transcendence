import Babact from "babact"
import ProfileCard from "../components/Profile/ProfileCard"
import AuthCard from "../components/Auth/AuthCard"
import { useAuth } from "../contexts/useAuth"
import Menu from "../components/Menu/Menu"
import useWebSocket from "../hooks/useWebSocket"

export default function Home() {

	const { me } = useAuth()

	const ws = useWebSocket();

	Babact.useEffect(() => {
		if (!me) return
		// const ws = new WebSocket('wss://z1r3p1:7979/lobbies/join?token='+localStorage.getItem('access_token'));
		// console.log('ws', ws)
		ws.connect('wss://z1r3p1:7979/lobbies/join?token='+localStorage.getItem('access_token'));
	}, [me])

	return <div style='pointer-events: initial;'>
		<Menu/>
		{
			me ? <ProfileCard me={me}/> : <AuthCard/>
		}
		{ws.connected ? 'Connected' : 'Disconnected'}
	</div>
}