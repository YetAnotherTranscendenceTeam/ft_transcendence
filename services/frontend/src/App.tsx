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

export default function App() {
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
					<Route path='/games/:id' element={<OnlineView/>} />
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
