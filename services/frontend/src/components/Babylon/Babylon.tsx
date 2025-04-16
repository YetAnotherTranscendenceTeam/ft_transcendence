import Babact from "babact";
import PongClient from "./PongClient";
import TestPhysics from "./TestPhysics";
import useWebSocket from "../../hooks/useWebSocket";

export default function Babylon({
        app,
        ...props
    }: {
        app: PongClient
        [key: string]: any
    }) {

	return <canvas style="width: 100vw; height: 100vh; touch-action: none; position: absolute; top: 0; left: 0; z-index: -1" id="gameCanvas">
	</canvas>
}