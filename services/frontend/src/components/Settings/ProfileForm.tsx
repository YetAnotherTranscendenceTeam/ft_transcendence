import Babact from "babact";
import SettingsSection from "./SettingsSection";
import { Form } from "../../contexts/useForm";
import Input from "../../ui/Input";
import Submit from "../../ui/Submit";
import ImageSelector from "../../ui/ImageSelector";
import useAvatars from "../../hooks/useAvatars";
import useProfile from "../../hooks/useProfile";
import config from "../../config";

export default function ProfileForm({ me }: { me: any }) {

	const { avatars, uploadAvatar, deleteAvatar } = useAvatars();

	const { setSettings, isLoading } = useProfile();

	const handleSubmit = async (fields) => {
		setSettings({
			username: fields['profile-username'].value,
			avatar: fields['profile-avatar'].value
		});
	}

	if (!me)
		return null;
	return <SettingsSection name='Profile'>
		<Form formFields={['profile-username', 'profile-avatar']} className='gap-8'>
			<Input
				field="profile-username"
				label='Edit your username'
				type='text'
				placeholder={me.username}
				pattern={config.USERNAME_REGEX}
				help="Your unique identifier on the platform. It's how other players find and recognize you."
				tooltip={<div
					className='settings-tooltip flex flex-col'
				>
					Username must follow these rules:
					<ul>
						<li>At least 4 characters</li>
						<li>At most 15 characters</li>
						<li>Only letters, numbers, underscores and hyphen</li>
					</ul>
				</div>}
			/>
			<ImageSelector
				field="profile-avatar"
				label='Edit your avatar'
				defaultValue={me.avatar}
				images={avatars}
				onChange={(e: any) => uploadAvatar(e.target.result)}
				onImageRemove={deleteAvatar}
				webcam
				limit={5}
				help="Your avatar is your identity on the platform. Choose one that represents you best!"
				ignore={[me.avatar]}
				ignoreMessage="You can't delete your current avatar"
				tooltip={
					<div className='settings-tooltip flex flex-col'>
						Upload constraints:
						<ul>
							<li>Maximum 5 avatars</li>
							<li>Maximum 4Mo</li>
							<li>Available formats: PNG, JPG, JPEG, GIF or WEBP</li>
							<li>Minimum resolution of 32 x 32 pixels </li>
						</ul>
					</div>
				}
			/>

			<div className='flex gap-4 justify-end'>
				<Submit
					fields={['profile-username', 'profile-avatar']}
					onSubmit={handleSubmit}
					loading={isLoading}
					disabled={(fields) => (fields['profile-username'].value === '' || fields['profile-username'].value === me.username) && fields['profile-avatar'].value === me.avatar}
				>
					Save
					<i className="fa-regular fa-floppy-disk"></i>
				</Submit>
			</div>
		</Form>
	</SettingsSection>
}