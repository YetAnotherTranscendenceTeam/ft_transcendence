import Babact from "babact";
import Card from "../../ui/Card";
import "./profile.css";
import Avatar from "../../ui/Avatar";
import Button from "../../ui/Button";
import useEscape from "../../hooks/useEscape";
import { IMe, useAuth } from "../../contexts/useAuth";
import { useNavigate } from "babact-router-dom";
import Label from "../../ui/Label";
import SocialManager from "../Social/SocialManager";
import SocialTypeText from "../Social/SocialTypeText";

export default function ProfileCard({ me, ...props } : { me: IMe, [key: string]: any }) {

	const [isOpen, setIsOpen] = Babact.useState<boolean>(false);

	const navigate = useNavigate();
	const { socials } = useAuth();

	useEscape(isOpen, () => setIsOpen(false));

	if (!me)
		return null;

	return <Card className={`profile-card left flex flex-col`} key='profile-card' {...props}>
		<div className='profile-card-header flex items-center gap-2 justify-between pointer'>
			<div
				className='flex flex-row items-center gap-2'
				onClick={() => navigate(`/profiles/${me.account_id}`)}
			>
				<Avatar src={me.avatar} name={me.username} status={me.status?.type}/>
				<div className='flex flex-col gap-1'>
					<h1>{me.username}</h1>
					{me.status && <SocialTypeText type={me.status.type} />}
				</div>
			</div>
			<div className='flex flex-row items-center gap-2'>
				<Button onClick={() => setIsOpen(!isOpen)}>
					{	!isOpen 
						? <>Open <i className="fa-solid fa-up-right-and-down-left-from-center"></i></>
						: <>Close <i className="fa-solid fa-down-left-and-up-right-to-center"></i></>
					}
					{socials?.pending.received.length > 0 && <Label>{socials.pending.received.length}</Label>}
				</Button>
			</div>
		</div>
		<div className={`profile-card-body flex flex-col gap-4 w-full ${isOpen ? 'open' : ''}`} key='social-manager-container'>
			<SocialManager key='social-manager'/>
		</div>
	</Card>;
}