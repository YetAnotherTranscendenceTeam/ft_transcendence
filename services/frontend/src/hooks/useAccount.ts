import Babact from "babact";
import config from "../config";
import { useAuth } from "../contexts/useAuth";
import useFetch from "./useFetch";
import useToast from "./useToast";

export default function useAccount() {

	const { ft_fetch, isLoading } = useFetch();
	const { me, refresh } = useAuth();
	const [payload, setPayload] = Babact.useState<string>(null);
	const { createToast } = useToast();

	const setSettings = async (settings: {
		email?: string,
		password?: string,
		old_password: string,
	}) => {
		const patch: {
			email?: string,
			password?: string,
			old_password: string,
		} = {
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
			show_error: true,
			error_messages: {
				403: "Invalid password",
				409: "Email already in use",
			}
		});

		if (response && response.statusCode === 202) {
			setPayload(response.payload_token);
		}
		else if (response) {
			createToast('Settings updated successfully');
			refresh();

		}

		return response;
	}


	const enable2FA = async () => {
		const response = await ft_fetch(`${config.API_URL}/2fa/app/activate`, {}, {
			show_error: true,
			error_messages: {
				409: "2FA already activated",
			}
		})
		return response;
	}

	const confirm2FA = async (code: string) => {
		const response = await ft_fetch(`${config.API_URL}/2fa/app/activate/verify`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				otp: code,
			})
		}, {
			success_message: "2FA activated successfully",
			show_error: true,
			error_messages: {
				403: "Invalid code",
			}
		})

		if (response)
			refresh();
		return response;
	}

	const disable2FA = async (otp: string) => {
		const response = await ft_fetch(`${config.API_URL}/2fa/app/deactivate`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				otp,
			})
		}, {
			success_message: "2FA disabled successfully",
			show_error: true,
			error_messages: {
				403: "Invalid code",
			}
		});

		return response;
	}

	const setSettings2FA = async (body: {
		otp: string,
		otp_method: string,
	}) => {
		const response = await ft_fetch(`${config.API_URL}/settings/account/2fa`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				payload_token: payload,
				...body
			})
		}, {
			show_error: true,
			success_message: "Settings updated successfully",
			error_messages: {
				403: "Invalid password",
				409: "Email already in use",
			},
			onError: (res) => {
				if (res.status !== 403)
					setPayload(null);
			}
		})

		if (response)
			refresh();
		return response;
	}

	return {
		setSettings,
		isLoading,
		enable2FA,
		confirm2FA,
		disable2FA,
		setSettings2FA,
		setPayload,
		payload,
	}

}