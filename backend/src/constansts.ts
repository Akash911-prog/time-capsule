const SALTROUNDS = 10;

const verifyEmailExpireDefaultTime = 30 * 60 * 1000;
const refreshTokenExpireTime = 7 * 24 * 60 * 60 * 1000;

const USERNAME_REGEX = /^[A-Za-z0-9_]+$/

export { SALTROUNDS, verifyEmailExpireDefaultTime, USERNAME_REGEX, refreshTokenExpireTime }
