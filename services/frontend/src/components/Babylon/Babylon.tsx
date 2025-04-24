import Babact from "babact";
import PongClient from "./PongClient";
import './babylon.css'

export default function Babylon({
        app,
        ...props
    }: {
        app: PongClient
        [key: string]: any
    }) {

	return <canvas 
        className="gameCanvas"
        id="gameCanvas"
    >
	</canvas>
}