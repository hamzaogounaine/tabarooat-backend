const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { serialize } = require("cookie");
const Redis = require("ioredis");
const UAParser = require("ua-parser-js");

const redis = new Redis(process.env.REDISCLOUD_URL || "redis://127.0.0.1:6379");

const getMessage = require("../utils/messages");
const getEmailTemplate = require("../utils/resetPasswordTemplate");
const { getVerificationEmail } = require("../utils/emailVerificationTemplate");
const getDeviceVerificationEmailTemplate = require("../utils/deviceVerificationTemplates");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "sandbox.smtp.mailtrap.io",
  port: process.env.EMAIL_PORT || 2525,
  secure: process.env.EMAIL_SECURE === "true", // Use 'true' for 465, 'false' for 587/2525
  auth: {
    user: process.env.MAILTRAP_USER || "07ad43d1ce15b8",
    pass: process.env.MAILTRAP_PASS || "ca4760dd690d08",
  },
  tls: {
    // Do not fail on invalid certs. Useful for local development with self-signed certs.
    // For production, this should generally be `true` or omitted for security.
    rejectUnauthorized: false,
  },
});

// For testing purposes with Ethereal Mail (if MAILTRAP_USER is not set)
if (process.env.NODE_ENV !== "production" && !process.env.MAILTRAP_USER) {
  nodemailer
    .createTestAccount()
    .then((account) => {
      console.log("Ethereal Test Account Created:");
      console.log("User:", account.user);
      console.log("Pass:", account.pass);
      console.log("SMTP URL:", nodemailer.getTestMessageUrl(account));
      transporter.options.auth.user = account.user;
      transporter.options.auth.pass = account.pass;
      transporter.options.host = account.smtp.host;
      transporter.options.port = account.smtp.port;
      transporter.options.secure = account.smtp.secure;
    })
    .catch(console.error);
}

// --- Helper Function for Sending Verification Email ---
const sendVerificationEmailHelper = async (user, lang) => {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const verificationLink = `${baseUrl}/verify-email?token=${user.emailVerificationToken}&email=${user.email}`;

  const { subject, html, text } = getVerificationEmail(
    lang || "en",
    verificationLink
  );

  await transporter.sendMail({
    from: process.env.FROM_EMAIL || "noreply@tabaroaat.com",
    to: user.email,
    subject,
    html,
    text,
  });
};

const sendDeviceVerificationCodeEmail = async (user, verificationCode, lang) => {
  const { subject, html, text } = getDeviceVerificationEmailTemplate(
    lang || "ar",
    verificationCode
  );

  const mailOptions = {
    from: process.env.FROM_EMAIL || "noreply@tabaroaat.com",
    to: user.email,
    subject,
    html,
    text,
  };

  await transporter.sendMail(mailOptions);
};
// --- End Helper Function ---

const registerUser = async (req, res) => {
  try {
    const { email, firstName, lastName, password, dob, termsAccepted, lang } =
      req.body;

    if (!email || !firstName || !lastName || !password || !dob) {
      return res
        .status(400)
        .json({ message: getMessage("requiredFields", lang) });
    }

    if (!termsAccepted) {
      return res
        .status(400)
        .json({ message: getMessage("termsRequired", lang) });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: getMessage("passwordTooShort", lang) });
    }

    // Calculate age more robustly to handle exact date comparison
    const dobDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }

    if (age < 18) {
      return res
        .status(400)
        .json({ message: getMessage("ageRequirement", lang) });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: getMessage("emailAlreadyExists", lang) });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token and set expiration for new user
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationTokenExpire = new Date(Date.now() + 3600000); // 1 hour validity

    const user = new User({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      dob: dobDate, // Save the actual Date object
      age, // Store calculated age
      termsAccepted,
      isVerified: false, // New users are unverified by default
      emailVerificationToken,
      emailVerificationTokenExpire,
    });

    await user.save();

    // --- Call the helper function to send verification email ---
    await sendVerificationEmailHelper(user, lang);

    return res.status(201).json({
      message: getMessage("registrationSuccess", lang),
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: getMessage("serverError", lang) });
  }
};

const verifyEmail = async (req, res) => {
  const { email, token, lang } = req.query;

  try {
    const user = await User.findOne({
      email,
      emailVerificationToken: token,
      emailVerificationTokenExpire: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: getMessage("invalidResetToken", lang) });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined; // Set to undefined to remove the field
    user.emailVerificationTokenExpire = undefined; // Set to undefined

    await user.save();

    res.status(200).json({ message: getMessage("verificationSuccess", lang) });
  } catch (error) {
    console.error("Email verification error:", error);
    res
      .status(500)
      .json({ message: getMessage("emailVerificationFailed", lang) });
  }
};

const loginUser = async (req, res) => {
  const block_time = 60 * 5; // Duration in seconds (5 minutes) for blocking an IP
  const userAgent = req.headers["user-agent"] || "Unknown";
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const device = parser.getDevice();

  const { email, password, lang } = req.body;
  try {
    // Helper function to increment Redis counter on failed attempts
    const incrementFailedAttempts = async () => {
      // Ensure req.rateLimitKey is set by a preceding middleware (e.g., for IP-based rate limiting)
      if (req.rateLimitKey) {
        const current = await redis.incr(req.rateLimitKey);
        // If this is the first failed attempt, set an expiry for the key
        if (current === 1) {
          await redis.expire(req.rateLimitKey, block_time);
        }
      }
    };

    // 1. Validate required fields
    if (!email || !password) {
      await incrementFailedAttempts();
      return res
        .status(400)
        .json({ message: getMessage("requiredFields", lang) });
    }

    // 2. Find the user by email
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      await incrementFailedAttempts();
      return res
        .status(401)
        .json({ message: getMessage("invalidCredentials", lang) });
    }

    // 3. Validate password
    const validPassword = await bcrypt.compare(password, existingUser.password);

    if (!validPassword) {
      await incrementFailedAttempts();
      return res
        .status(401)
        .json({ message: getMessage("invalidCredentials", lang) });
    }

    // 4. Check if user is verified
    if (!existingUser.isVerified) {
      await incrementFailedAttempts(); // Increment on unverified user trying to log in

      // Generate a new verification token and update user
      const newVerificationToken = crypto.randomBytes(32).toString("hex");
      existingUser.emailVerificationToken = newVerificationToken;
      existingUser.emailVerificationTokenExpire = new Date(
        Date.now() + 3600000
      ); // 1 hour validity
      await existingUser.save();

      // Send a new verification email
      await sendVerificationEmailHelper(existingUser, lang);

      return res.status(401).json({ message: getMessage("notVerified", lang) });
    }

    // --- New Device/IP Login Flow ---
    // If the last login IP doesn't match the current IP, initiate a new device verification
    if (existingUser.lastLoginIp !== req.ip) {
      // Generate a cryptographically secure 6-digit code
      const randomNumber = crypto.randomBytes(3).readUIntBE(0, 3);
      const verificationCode = String(randomNumber % 1000000).padStart(6, "0");

      existingUser.verificationCode = verificationCode;
      existingUser.verificationCodeExpire = Date.now() + 1000 * 60 * 10;
      await sendDeviceVerificationCodeEmail(existingUser, verificationCode, lang);
      await existingUser.save();

      return res.status(200).json({
        message: getMessage("deviceVerificationSent", lang),
        requiresVerificationCode: true,
        email: existingUser.email,
      });
    }

    // If all checks pass and it's not a new device, proceed with standard login
    // Clear the rate limit key for this IP on successful login.
    if (req.rateLimitKey) {
      await redis.del(req.rateLimitKey);
    }

    // Update last login details
    existingUser.lastLoginIp = req.ip;
    existingUser.lastUsedDevice = device;
    existingUser.lastUsedBrowser = browser;

    await existingUser.save(); // Save the updated user details

    // 5. Generate JWT token
    const token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email, type: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "5h" } // JWT expires in 2 hours
    );

    // 6. Set JWT as an HttpOnly cookie
    res.setHeader(
      "Set-Cookie",
      serialize("token", token, {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: true, // Only send over HTTPS in production
        sameSite: "Lax", // Protects against CSRF attacks
        maxAge: 7200, // Matches the JWT expiry (2 hours in seconds)
        path: "/", // Cookie is valid for all paths
      })
    );

    // 7. Send successful login response
    return res.status(200).json({
      token,
      user: {
        id: existingUser._id,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    // Do NOT increment Redis here, as this is a server-side error, not a user-induced failed attempt.
    return res.status(500).json({ message: getMessage("serverError", lang) }); // Server error occurred
  }
};

const logoutUser = async (req, res) => {
  const { lang } = req.body;
  try {
    // Clear the 'token' cookie by setting an expired cookie
    res.setHeader(
      "Set-Cookie",
      serialize("token", "", {
        // Set value to empty string
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        maxAge: 0, // Set maxAge to 0 to expire the cookie immediately
        expires: new Date(0), // Set expires to a past date (epoch) for immediate expiration
        path: "/",
      })
    );

    return res.status(200).json({ message: getMessage("logoutSuccess", lang) });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: getMessage("serverError", lang) });
  }
};

const sendResetPasswordLink = async (req, res) => {
  try {
    const { email, lang } = req.body;

    // Input validation
    if (!email.trim()) {
      return res
        .status(400)
        .json({ message: getMessage("emailRequired", lang) });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: getMessage("invalidEmailFormat", lang) });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Security best practice: don't confirm if email exists
      return res.status(200).json({
        message: getMessage("emailVerificationSent", lang),
      });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpire = Date.now() + 1000 * 60 * 30; // 30 minutes (changed from 0.5 to 30 for clarity)
    await user.save();

    // Use environment variable for base URL
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // Enhanced email template
    const { subject, html, text } = getEmailTemplate(lang || "en", resetLink);

    // Send email with error handling

    const mailOptions = {
      from: process.env.FROM_EMAIL || "noreply@tabaroaat.com",
      to: user.email,
      subject,
      html,
      text,
    };

    await transporter.sendMail(mailOptions);

    // Log successful email send (without sensitive data)
    console.log(`Password reset email sent to: ${email}`);

    return res.status(200).json({
      message: getMessage("resetLinkSent", lang),
      tokenExpiry: "30 minutes",
    });
  } catch (error) {
    console.error("Send Reset Password Link error:", error); // Specific error log

    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      return res
        .status(500)
        .json({ message: "خطأ في الاتصال بخدمة البريد الإلكتروني" });
    }

    return res.status(500).json({ message: getMessage("serverError", lang) });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password, lang } = req.body;
    const { token } = req.params; // Assuming token is from URL params

    if (!password || password.length < 6) {
      // Add password validation
      return res
        .status(400)
        .json({ message: getMessage("passwordTooShort", lang) });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: new Date() }, // Use new Date() for current time
    });

    if (!user) {
      return res
        .status(400) // Changed from 404 to 400 for consistency with "invalid or expired"
        .json({ message: getMessage("invalidResetToken", lang) });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetToken = undefined; // Set to undefined to remove field
    user.resetTokenExpire = undefined; // Set to undefined
    await user.save();

    return res
      .status(200)
      .json({ message: getMessage("passwordResetSuccess", lang) }); // Changed to 200 OK
  } catch (err) {
    console.error("Reset password error:", err); // Log the actual error
    return res.status(500).json({ message: getMessage("serverError", lang) }); // Return a server error
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email, lang } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      console.log(`Attempted resend for non-existent email: ${email}`);
      return res.status(200).json({
        message: getMessage("emailVerificationSent", lang),
      });
    }

    if (user.isVerified) {
      return res
        .status(200)
        .json({ message: getMessage("alreadyVerified", lang) });
    }

    // Generate new token and set new expiration
    const newVerificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = newVerificationToken;
    user.emailVerificationTokenExpire = new Date(Date.now() + 3600000); // 1 hour validity

    // --- Call the helper function to send verification email ---
    await sendVerificationEmailHelper(user, lang);

    await user.save(); // Save updated user with new token/expiration

    return res.status(200).json({
      message: getMessage("resendVerificationSuccess", lang),
    });
  } catch (err) {
    console.error("Resend verification error:", err);
    return res.status(500).json({ message: getMessage("serverError", lang) });
  }
};

const checkLoginStatus = (req, res) => {
  try {
    // 1. Get the token from the request cookies
    // Assumes 'cookie-parser' middleware is being used to populate req.cookies
    const token = req.cookies.token;

    // 2. If no token is found, the user is not logged in
    if (!token) {
      console.log("Check Login Status: No token found.");
      return res
        .status(200)
        .json({ isLoggedIn: false, message: getMessage("tokenMissing", lang) });
    }

    // 3. Verify the token using the secret key
    // process.env.JWT_SECRET must be defined in your .env file
    // The jwt.verify method will throw an error if the token is invalid or expired.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. If verification is successful, the user is logged in
    // You can return some decoded user information (e.g., userId, email)
    console.log("Check Login Status: Token valid, user logged in.");
    return res.status(200).json({
      isLoggedIn: true,
      user: {
        userId: decoded.userId,
        email: decoded.email,
        type: decoded.type,
        // Add any other claims you put in your JWT payload
      },
      message: getMessage("loginSuccess", lang),
    });
  } catch (error) {
    // 5. If verification fails (e.g., token expired, invalid signature), the user is not logged in
    console.error(
      "Check Login Status: Token verification failed:",
      error.message
    );

    // If the token is expired or invalid, send isLoggedIn: false
    // You might also want to clear the invalid cookie on the client side,
    // or send a response header to clear it if this is an API endpoint.
    // For a simple status check, just reporting false is often enough.

    // To clear the cookie from the server side for an invalid token:
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/",
    });

    return res.status(200).json({
      isLoggedIn: false,
      message: `Authentication failed: ${error.message}. Token cleared.`,
      error: error.message,
    });
  }
};

const checkDeviceVerificationCode = async (req, res) => {
  const { email, code, lang } = req.body;

  try {
    // 1. Find the user and verify the code and its expiration in one query
    const user = await User.findOne({
      email,
      verificationCode: code,
      verificationCodeExpire: { $gt: new Date() }, // Check if the code is still valid (greater than current date)
    });

    if (!user) {
      // If no user is found with the given email, code, and valid expiration
      return res
        .status(400)
        .json({ message: getMessage("invalidResetToken"), lang });
    }

    // 2. Clear the verification code and its expiration from the user document
    // This makes the code single-use
    user.verificationCode = undefined; // Remove the field
    user.verificationCodeExpire = undefined; // Remove the field

    // Update last login details after successful device verification
    // Ensure req.ip is available (e.g., via Express middleware)
    // If this is a Next.js API route, req.ip might be undefined; you'd need to parse from headers like 'x-forwarded-for'
    user.lastLoginIp = req.ip; // Assuming req.ip is correctly populated by your server setup

    const userAgent = req.headers["user-agent"] || "Unknown";
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser();
    const device = parser.getDevice();
    user.lastUsedDevice = device;
    user.lastUsedBrowser = browser;

    await user.save(); // Save the updated user document

    // 3. Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, type: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "5h" } // JWT expires in 5 hours
    );

    // 4. Calculate cookie maxAge to match JWT expiresIn
    const fiveHoursInSeconds = 5 * 60 * 60; // 18000 seconds
    console.log("Attempting to set cookie for token:", token);
    // 5. Set JWT as an HttpOnly cookie
    res.setHeader(
      "Set-Cookie",
      serialize("token", token, {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: true, // Only send over HTTPS in production
        sameSite: "Lax", // Protects against CSRF attacks
        maxAge: fiveHoursInSeconds, // Matches the JWT expiry (5 hours in seconds)
        path: "/", // Cookie is valid for all paths
      })
    );

    // 6. Send successful login response
    return res.status(200).json({
      message: getMessage("deviceVerified", lang),
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Device verification error:", error);
    return res.status(500).json({ message: getM });
  }
};

module.exports = {
  registerUser,
  loginUser,
  sendResetPasswordLink,
  resetPassword,
  logoutUser,
  verifyEmail,
  resendVerification,
  checkLoginStatus,
  checkDeviceVerificationCode,
};
