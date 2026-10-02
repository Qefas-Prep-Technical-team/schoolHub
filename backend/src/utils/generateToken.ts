import jwt, { SignOptions } from "jsonwebtoken";

export const generateToken = (payload: object) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");

  const options: SignOptions = {
    expiresIn: "30d",
  };

  return jwt.sign(payload, secret, options);
};
