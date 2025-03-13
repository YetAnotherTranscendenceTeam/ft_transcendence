import Babact from "babact";

const LobbyContext = Babact.createContext();

export const LobbyProvider = ({
		children
	} : {
		children?: any
	}) => {

	const [lobby, setLobby] = Babact.useState(null);


	return (
		<LobbyContext.Provider
			value={{
				lobby
			}}
		>
			{children}
		</LobbyContext.Provider>
	);
};

export const useLobby = () => {
	return Babact.useContext(LobbyContext);
};