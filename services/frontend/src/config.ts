export default {
	  API_URL: `${process.env.BACKEND_URL}/api`,
	  PASSWORD_REGEX: "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$",
	  EMAIL_REGEX: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"
}