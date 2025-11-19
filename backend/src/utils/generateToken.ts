import jwt, { SignOptions } from "jsonwebtoken";

export const generateToken = (payload: object) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");

  const options: SignOptions = {
    expiresIn: "30" as unknown as import("ms").StringValue, // ✅ cast to ms.StringValue
  };

  return jwt.sign(payload, secret, options);
};
