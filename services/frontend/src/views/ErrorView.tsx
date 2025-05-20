import Babact from "babact";
import { useNavigate } from "babact-router-dom";
import Button from "../ui/Button";
import { usePong } from "../contexts/usePong";
import { GameScene } from "../components/Babylon/types";

export default function ErrorView({
		errorCode,
		errorMessage,
	}: {
		errorCode: number;
		errorMessage: string;
	}) {

	const { app } = usePong();
	const navigate = useNavigate();

	Babact.useEffect(() => {
		app.setGameScene(GameScene.MENU);
	}, [])
	
	return <div className="error-view flex flex-col items-center justify-center h-full w-full gap-4">
		<h1>{errorCode}</h1>
		<p>{errorMessage}</p>
		<Button
			className="primary"
			onClick={() => navigate("/")}
		>
			<i className="fa-solid fa-house"></i> Go to Home
		</Button>
	</div>
}