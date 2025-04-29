const refreshTokenDuration = 7 * 24 * 60 * 60 * 1000; // 7d in milliseconds

export function setRefreshTokenCookie(reply, tokens) {
  reply.setCookie("refresh_token", tokens.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/token",
    maxAge: refreshTokenDuration,
  });
};
