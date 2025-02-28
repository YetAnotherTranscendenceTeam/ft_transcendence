import Babact from "babact";
import Button from "../../ui/Button";
import Avatar from "../../ui/Avatar";
import { Profile } from "../../contexts/useAuth";
import Input from "../../ui/Input";
import { Form } from "../../contexts/useForm";

export default function SocialManager({ className = '', children, ...props }: { className?: string, children?: any }) {

	const [selected, setSelected] = Babact.useState('follow');

	const follows: Profile[]= [
		{
			username: 'bwisniew',
			elo: 1200,
			avatar: 'https://cdn.intra.42.fr/users/c4d09e1b88c5f1eaf042f81914ccdbb8/bwisniew.JPG'
		},
		{
			username: 'ibertran',
			elo: 600,
			avatar: 'https://cdn.intra.42.fr/users/b3bd01f8d5a13391c731d3501af9ae7e/ibertran.jpg'
		},
		{
			username: 'anfichet',
			elo: 800,
			avatar: 'https://cdn.intra.42.fr/users/477cad5905c6b2cb7ce7eeb1ed1afe6a/anfichet.JPG'
		},
		{
			username: 'bwisniew',
			elo: 1200,
			avatar: 'https://cdn.intra.42.fr/users/c4d09e1b88c5f1eaf042f81914ccdbb8/bwisniew.JPG'
		},
		{
			username: 'ibertran',
			elo: 600,
			avatar: 'https://cdn.intra.42.fr/users/b3bd01f8d5a13391c731d3501af9ae7e/ibertran.jpg'
		},
		{
			username: 'anfichet',
			elo: 800,
			avatar: 'https://cdn.intra.42.fr/users/477cad5905c6b2cb7ce7eeb1ed1afe6a/anfichet.JPG'
		},
		{
			username: 'bwisniew',
			elo: 1200,
			avatar: 'https://cdn.intra.42.fr/users/c4d09e1b88c5f1eaf042f81914ccdbb8/bwisniew.JPG'
		},
		{
			username: 'ibertran',
			elo: 600,
			avatar: 'https://cdn.intra.42.fr/users/b3bd01f8d5a13391c731d3501af9ae7e/ibertran.jpg'
		},
		{
			username: 'anfichet',
			elo: 800,
			avatar: 'https://cdn.intra.42.fr/users/477cad5905c6b2cb7ce7eeb1ed1afe6a/anfichet.JPG'
		},
		{
			username: 'bwisniew',
			elo: 1200,
			avatar: 'https://cdn.intra.42.fr/users/c4d09e1b88c5f1eaf042f81914ccdbb8/bwisniew.JPG'
		},
		{
			username: 'ibertran',
			elo: 600,
			avatar: 'https://cdn.intra.42.fr/users/b3bd01f8d5a13391c731d3501af9ae7e/ibertran.jpg'
		},
		{
			username: 'anfichet',
			elo: 800,
			avatar: 'https://cdn.intra.42.fr/users/477cad5905c6b2cb7ce7eeb1ed1afe6a/anfichet.JPG'
		},
	]

	return <div className={`social-manager ${className}`} {...props}>
		<div className='social-manager-tabbar flex flex-row'>
			<Button className={`ghost ${selected === 'follow' ? 'selected' : ''}`} onClick={() => setSelected('follow')}>
				<i className="fa-solid fa-user-group"></i> Follow
			</Button>
			<Button className={`ghost ${selected === 'add' ? 'selected' : ''}`} onClick={() => setSelected('add')}>
				<i className="fa-solid fa-user-plus"></i> Add
			</Button>
		</div>
		<div className='social-manager-content flex flex-row gap-4'>
		<div className={`social-manager-tab scrollbar flex flex-col gap-2 ${selected === 'follow' ? 'open' : ''}`}>
				{
					follows.length ? follows.map((follow) => <div className='social-manager-follow-card flex flex-row items-center justify-between gap-2 w-full'>
						<div className='flex flex-row items-center gap-2'>
							<Avatar src={follow.avatar} name={follow.username}/>
							<div className='flex flex-col gap-1'>
								<h1>{follow.username}</h1>
								<h2>{follow.elo} Elo</h2>
							</div>
						</div> 
						<div className='flex flex-row items-center gap-2'>
							<Button className='danger icon'>
								<i class="fa-solid fa-user-minus"></i>
							</Button>
						</div>
					</div>)
					: <div className='flex flex-col w-full items-center justify-center h-full gap-4'>
						No follows yet
						<Button className="primary" onClick={() => setSelected('add')}>
							Add one now <i className="fa-solid fa-plus"></i>
						</Button>
					</div>
				}
			</div>
			<div className={`social-manager-tab social-manager-add flex flex-col gap-2 ${selected === 'add' ? 'open' : ''}`}>
				<Form formFields={['username']}>
					<Input
						field='username'
						placeholder='Username'
						onInput={(e: any) => console.log(e.target.value)}
					/>
				</Form>
				<div className='social-manager-add-list flex scrollbar flex-col gap-1 h-full'>
					{
						follows.length ? follows.map((follow) => <div className='social-manager-follow-card flex flex-row items-center justify-between gap-2 w-full'>
							<div className='flex flex-row items-center gap-2'>
								<Avatar src={follow.avatar} name={follow.username}/>
								<div className='flex flex-col gap-1'>
									<h1>{follow.username}</h1>
									<h2>{follow.elo} Elo</h2>
								</div>
							</div> 
							<div className='flex flex-row items-center gap-2'>
								<Button className='success icon'>
									<i class="fa-solid fa-user-plus"></i>
								</Button>
							</div>
						</div>)
						: <div className='flex flex-col w-full items-center justify-center h-full gap-4'>
							No user found
						</div>
					}
				</div>
			</div>
		</div>
	</div>
}