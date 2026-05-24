import jwt from 'jsonwebtoken';

export const getAuthCookieOptions = () => {
	const isProduction = process.env.NODE_ENV === "production";
	return {
		httpOnly: true,
		secure: isProduction,
		// Cross-domain frontend/backend on Vercel needs SameSite=None.
		sameSite: isProduction ? "none" : "strict",
		maxAge: 24 * 60 * 60 * 1000, // 1 day
	};
};

const generateTokenSetCookie = (res, developerId) => {
	const token = jwt.sign({id: developerId}, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});

	res.cookie("token", token, getAuthCookieOptions());

	return token;

};

export default generateTokenSetCookie ;
