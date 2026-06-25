import { totp } from "otplib";

totp.options = {
  step: 600,
  digits: 6,
  window: 1,
};

export const generateOtp = (secret: string): string => {
  return totp.generate(secret);
};

export const verifyOtp = (token: string, secret: string): boolean => {
  return totp.check(token, secret);
};
