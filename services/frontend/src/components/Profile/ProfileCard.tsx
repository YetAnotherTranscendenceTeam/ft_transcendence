import Babact from "babact";
import Card from "../../ui/Card";
import "./profile.css";
import Avatar from "../../ui/Avatar";
import Button from "../../ui/Button";

export default function ProfileCard({ ...props }) {
	return (<Card className={`profile-card`} {...props}>
		<div className='profile-card-header flex items-center gap-2 justify-between'>
			<div className='flex flex-row items-center gap-2'>
				<Avatar src="https://cdn.intra.42.fr/users/c4d09e1b88c5f1eaf042f81914ccdbb8/bwisniew.JPG" name="bwisniew"/>
				<div className='flex flex-col gap-1'>
					<h1>Bwisniew</h1>
					<h2>1200 Elo</h2>
				</div>
			</div>
			<div className='flex flex-row items-center gap-2'>
				<Button>
					Open <i className="fa-solid fa-up-right-and-down-left-from-center"></i>
				</Button>
			</div>
		</div>
	</Card>);
}