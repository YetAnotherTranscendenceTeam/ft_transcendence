import Babact from "babact";
import { Route, Router, Routes } from "babact-router-dom";
import Home from "./views/Home";
import FortytwoView from "./views/FortytwoView";
import { UiProvider } from "./contexts/useUi";
import { AuthProvider } from "./contexts/useAuth";
import { LobbyProvider } from "./contexts/useLobby";
import LobbyView from "./views/LobbyView";
import ProfileView from "./views/ProfileView";
import { PongProvider } from "./contexts/usePong";
import LocalView from "./views/LocalView";
import TournamentView from "./views/TournamentView";
import OnlineView from "./views/OnlineView";
import { OverlayProvider } from "./contexts/useOverlay";

export default function App() {

	const handleReload = (e: BeforeUnloadEvent	) => {
		const msg = 'Are you sure you want to reload?';
		e.preventDefault();
		e.returnValue = msg;
		return msg;
	}

	Babact.useEffect(() => {
		if (process.env.NODE_ENV !== 'production')
			return;
		window.addEventListener('beforeunload', handleReload);
		return () => {
			window.removeEventListener('beforeunload', handleReload);
		}
	}, []);


	return <Router>
		<UiProvider>
		<PongProvider>
		<AuthProvider>
		<LobbyProvider>
		<OverlayProvider>
		<Routes>
			<Route path="/fortytwo" element={<FortytwoView key='fortytwo-view'/>} key='fortytwo-view' />
			<Route path='/lobby/:code' element={<LobbyView key='lobby-view'/>} key='lobby-view'/>
			<Route path='/profiles/:id' element={<ProfileView key='profiles-view'/>} key='profiles-view'/>
			<Route path='/local' element={<LocalView key='local-view'/>} key='local-view'/>
			<Route path='/matches/:id' element={<OnlineView key='matches-view'/>} key='matches-view'/>
			<Route path='/tournaments/:id' element={<TournamentView key='tournaments-view'/>} key='tournaments-view'/>
			<Route path="/*" element={<Home key='home-view'/>} key='home-view'/>
		</Routes>
		</OverlayProvider>
		</LobbyProvider>
		</AuthProvider>
		</PongProvider>
		</UiProvider>
	</Router>
}
