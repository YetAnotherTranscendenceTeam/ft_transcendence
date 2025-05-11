import Babact from "babact";
import Button from "../../ui/Button";
import { Request } from "../../hooks/useSocials";
import SocialCard from "./SocialCard";

export default function SocialRequestCard({
		request,
		requestType,
		...props
	}: {
		request: Request,
		requestType: 'sent' | 'recieved',
		[key: string]: any
	}) {

	const [isLoading, setIsLoading] = Babact.useState<boolean>(false);

	const handleAccept = async (e: MouseEvent) => {
		e.stopPropagation();
		setIsLoading(true);
		const res = await request.accept();
		if (!res)
			setIsLoading(false);
	}
	
	const handleCancel = async (e: MouseEvent) => {
		e.stopPropagation();
		setIsLoading(true);
		const res = await request.cancel();
		if (!res)
			setIsLoading(false);
	}

	const handleBlock = async (e: MouseEvent) => {
		e.stopPropagation();
		setIsLoading(true);
		const res = await request.profile.block();
		if (!res)
			setIsLoading(false);
	}


	return <SocialCard
		user={request.profile}
	>
		{requestType === 'recieved' && <div
			className='flex flex-row items-center justify-end gap-2'
			>
			<Button
				className='success icon'
				onClick={(e) => handleAccept(e)}
				loading={isLoading}
				>
				<i className="fa-solid fa-user-check"></i>
			</Button>
			<Button
				className='danger icon'
				onClick={(e) => handleCancel(e)}
				loading={isLoading}
				>
				<i className="fa-solid fa-user-xmark"></i>
			</Button>
			<Button
				className="info icon"
				loading={isLoading}
				onClick={(e) => handleBlock(e)}
				>
				<i className="fa-solid fa-ban"></i>
			</Button>
		</div>}


		{requestType === 'sent' && <div
			className='flex flex-row items-center gap-2'
			>
			<Button
				loading={isLoading}
				className='danger'
				onClick={(e) => handleCancel(e)}
			>
				Cancel <i className="fa-solid fa-user-xmark"></i>
			</Button>
		</div>
		}
	</SocialCard>
}