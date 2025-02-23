import Babact from "babact";
import PongClient from "./PongClient";

export default function Babylon() {

    Babact.useEffect(() => {
        const app = new PongClient();
		app.run();
        return () => {
            app.destroy();
        }
    }, [])

	return <canvas style="width: 100vw; height: 100vh; touch-action: none; position: absolute; top: 0; left: 0;" id="gameCanvas">
	</canvas>
}