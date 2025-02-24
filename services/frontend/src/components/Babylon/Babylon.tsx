import Babact from "babact";
import PongClient from "./PongClient";

export default function Babylon() {

    Babact.useEffect(() => {
        const app = new PongClient();
        return () => {
            app.destroy();
        }
    }, [])

	return <canvas style="width: 100vw; height: 100vh; touch-action: none; position: absolute; top: 0; left: 0; z-index: -1" id="gameCanvas">
	</canvas>
}