import Babact from "babact";
import { Route, Router, Routes } from "babact-router-dom";
import LoginView from "./views/LoginView";
import SigninView from "./views/SigninView";
import Babylon from "./components/Babylon/Babylon";
import Home from "./views/Home";
import FortytwoView from "./views/FortytwoView";
import { UiProvider } from "./contexts/useUi";
import { AuthProvider } from "./contexts/useAuth";

export default function App() {
	return <Router>
		<UiProvider>
			<Babylon />
			<AuthProvider>
				<div style="width: 100vw; height: 100vh; position: absolute; top: 0; left: 0;">
					<Routes>
						<Route path="/login" element={<LoginView />} />
						<Route path="/signin" element={<SigninView />} />
						<Route path="/fortytwo" element={<FortytwoView/>} />
						<Route path="/*" element={<Home />} />
					</Routes>
				</div>
			</AuthProvider>
		</UiProvider>
	</Router>
}
