import Babact from "babact"
import Overlay from "../templates/Overlay"
import Button from "../ui/Button"
import useFetch from "../hooks/useFetch";
 
export default function Home() {

	const { forceRefresh } = useFetch();

	return <Overlay>
		<h1>Home</h1>
		<div className='flex'>
			<Button
				style='margin-top: 5rem;'
				onClick={() => forceRefresh()}
			>
				Refresh
			</Button>
		</div>
	</Overlay>
}