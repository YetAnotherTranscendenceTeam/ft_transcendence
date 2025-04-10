import Babact from "babact";
import { Route, Router, Routes } from "babact-router-dom";
import Babylon from "./components/Babylon/Babylon";
import Home from "./views/Home";
import FortytwoView from "./views/FortytwoView";
import { UiProvider } from "./contexts/useUi";
import { AuthProvider } from "./contexts/useAuth";
import { LobbyProvider } from "./contexts/useLobby";
import LobbyView from "./views/LobbyView";

export default function App() {
	return <Router>
		<UiProvider>
		<Babylon key="babylon"/>
		<AuthProvider>
		<LobbyProvider>
			<div style="width: 100vw; height: 100vh; position: absolute; top: 0; left: 0; pointer-events: none;">
				<Routes>
					<Route path="/fortytwo" element={<FortytwoView/>} />
					<Route path='/lobby/:code' element={<LobbyView/>} />
					<Route path="/*" element={<Home />} />
				</Routes>
			</div>
		</LobbyProvider>
		</AuthProvider>
		</UiProvider>
	</Router>
}
