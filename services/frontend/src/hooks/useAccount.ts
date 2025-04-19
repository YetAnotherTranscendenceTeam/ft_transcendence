import config from "../config";
import { useAuth } from "../contexts/useAuth";
import useFetch from "./useFetch";

export default function useAccount() {

	const { ft_fetch, isLoading } = useFetch();
	const { me, refresh } = useAuth();

	const setSettings = async (settings: {
		email?: string,
		password?: string,
		old_password: string,
	}) => {
		const patch: {
			auth_method: string,
			email?: string,
			password?: string,
			old_password: string,
		} = {
			auth_method: me.credentials.auth_method,
			old_password: settings.old_password,
		};

		if (settings.email !== me.credentials.email)
			patch.email = settings.email;
		if (settings.password)
			patch.password = settings.password;

		const response = await ft_fetch(`${config.API_URL}/settings/account`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(patch)
		}, {
			success_message: "Settings updated successfully",
			show_error: true,
			error_messages: {
				403: "Invalid password",
				409: "Email already in use",
			}
		});

		if (response)
			refresh();

		return response;
	}


	const enable2FA = async () => {
		const response = await ft_fetch(`${config.API_URL}/2fa/totp/activate`, {}, {
			show_error: true,
			error_messages: {
				409: "2FA already activated",
			}
		})
		return response;
	}

	return {
		setSettings,
		isLoading,
		enable2FA
	}

}