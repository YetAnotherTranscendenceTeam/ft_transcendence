import HttpError, { httpErrMessages } from "./HttpError.js";

export default async function ft_fetch(url, options) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      console.error("YATT.fetch():", data);
      const message = httpErrMessages.get(response.status);
      throw new HttpError(response.status, response.statusText, message);
    }
  } catch (err) {
    if (err instanceof HttpError) throw err;
    console.error("caught YATT.fetch():", err);
    throw new HttpError.BadGateway();
  }
}
