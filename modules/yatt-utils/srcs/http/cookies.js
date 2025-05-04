const refreshTokenDuration = 7 * 24 * 60 * 60; // 7d in seconds

export function setRefreshTokenCookie(reply, tokens) {
  reply.setCookie("refresh_token", tokens.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/token",
    maxAge: refreshTokenDuration,
  });
};
