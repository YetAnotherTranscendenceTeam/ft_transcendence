import Babact from "babact";
import Card from "../../ui/Card";
import "./profile.css";
import Avatar from "../../ui/Avatar";
import Button from "../../ui/Button";
import Separator from "../../ui/Separator";
import SocialManager from "./SocialManager";
import { Profile } from "../../contexts/useAuth";

export default function ProfileCard({ me, ...props } : { me: Profile, [key: string]: any }) {

	const [isOpen, setIsOpen] = Babact.useState(false);

	return <Card className={`profile-card left flex flex-col gap-4`} {...props}>
		<div className='profile-card-header flex items-center gap-2 justify-between'>
			<div className='flex flex-row items-center gap-2'>
				<Avatar src={me.avatar} name={me.username}/>
				<div className='flex flex-col gap-1'>
					<h1>{me.username}</h1>
					<h2>{me.elo ? me.elo : '0'} Elo</h2>
				</div>
			</div>
			<div className='flex flex-row items-center gap-2'>
				<Button onClick={() => setIsOpen(!isOpen)}>
					{	!isOpen 
						? <>Open <i className="fa-solid fa-up-right-and-down-left-from-center"></i></>
						: <>Close <i className="fa-solid fa-down-left-and-up-right-to-center"></i></>
					}
				</Button>
			</div>
		</div>
		<div className={`profile-card-body flex flex-col gap-4 w-full ${isOpen ? 'open' : ''}`}>
			<Separator/>
			<SocialManager />
		</div>
	</Card>;
}