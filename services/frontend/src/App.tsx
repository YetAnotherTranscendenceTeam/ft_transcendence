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
			<div style="width: 100vw; height: 100vh; position: absolute; top: 0; left: 0; pointer-events: none;">
				<Routes>
					<Route path="/fortytwo" element={<FortytwoView/>} />
					<Route path='/lobby/:code' element={<LobbyView/>} />
					<Route path='/profiles/:id' element={<ProfileView/>} />
					<Route path='/local' element={<LocalView/>} />
					<Route path='/tournaments/:id' element={<TournamentView/>} />
					<Route path="/*" element={<Home />} />
				</Routes>
			</div>
		</LobbyProvider>
		</AuthProvider>
		</PongProvider>
		</UiProvider>
	</Router>
}
