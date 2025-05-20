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
import { RTTournamentProvider } from "./contexts/useRTTournament";
import SpectatorView from "./views/SpectatorView";
import ErrorView from "./views/ErrorView";

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
		<RTTournamentProvider>
		<LobbyProvider>
		<OverlayProvider>
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path='/local' element={<LocalView />} />
			<Route path="/fortytwo" element={<FortytwoView />} />
			<Route path='/lobby/:code' element={<LobbyView />} />
			<Route path='/profiles/:id' element={<ProfileView />} />
			<Route path='/spectate/:id' element={<SpectatorView />} />
			<Route path='/matches/:id' element={<OnlineView />} />
			<Route path='/tournaments/:id' element={<TournamentView />} />
			<Route path='/*' element={<ErrorView errorMessage="Page not found" errorCode={404}/>} />
		</Routes>
		</OverlayProvider>
		</LobbyProvider>
		</RTTournamentProvider>
		</AuthProvider>
		</PongProvider>
		</UiProvider>
	</Router>
}
