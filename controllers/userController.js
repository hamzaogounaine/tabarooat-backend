const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { serialize } = require("cookie");
const Redis = require('ioredis')

const redis = new Redis();


const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "sandbox.smtp.mailtrap.io",
  port: process.env.EMAIL_PORT || 2525,
  secure: process.env.EMAIL_SECURE === 'true', // Use 'true' for 465, 'false' for 587/2525
  auth: {
    user: process.env.MAILTRAP_USER || "071b9d7d870934",
    pass: process.env.MAILTRAP_PASS || "4ce1ac460b1dc3",
  },
  tls: {
    // Do not fail on invalid certs. Useful for local development with self-signed certs.
    // For production, this should generally be `true` or omitted for security.
    rejectUnauthorized: false
  }
});

// For testing purposes with Ethereal Mail (if MAILTRAP_USER is not set)
if (process.env.NODE_ENV !== 'production' && !process.env.MAILTRAP_USER) {
    nodemailer.createTestAccount().then(account => {
        console.log('Ethereal Test Account Created:');
        console.log('User:', account.user);
        console.log('Pass:', account.pass);
        console.log('SMTP URL:', nodemailer.getTestMessageUrl(account));
        transporter.options.auth.user = account.user;
        transporter.options.auth.pass = account.pass;
        transporter.options.host = account.smtp.host;
        transporter.options.port = account.smtp.port;
        transporter.options.secure = account.smtp.secure;
    }).catch(console.error);
}
// --- End Centralized Transporter Setup ---


// --- Helper Function for Sending Verification Email ---
const sendVerificationEmailHelper = async (user) => {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const verificationLink = `${baseUrl}/verify-email?token=${user.emailVerificationToken}&email=${user.email}`;

  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">تأكيد بريدك الإلكتروني</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
                مرحباً بك في منصة التبرعات!
                <br>
                لإكمال تسجيل حسابك، يرجى النقر على الرابط أدناه لتأكيد بريدك الإلكتروني:
            </p>
            <div style="margin: 30px 0;">
                <a href="${verificationLink}"
                   style="background-color: #28a745; color: white; padding: 12px 30px;
                          text-decoration: none; border-radius: 5px; font-weight: bold;
                          display: inline-block;">
                    تأكيد البريد الإلكتروني
                </a>
            </div>
            <p style="color: #999; font-size: 14px;">
                هذا الرابط صالح لمدة ساعة واحدة فقط.
            </p>
            <p style="color: #999; font-size: 14px;">
                إذا لم تقم بإنشاء حساب في منصة التبرعات، يرجى تجاهل هذه الرسالة.
            </p>
        </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.FROM_EMAIL || "noreply@tabaroaat.com",
    to: user.email,
    subject: "تأكيد بريدك الإلكتروني - منصة التبرعات",
    html: emailTemplate,
    text: `
        تأكيد بريدك الإلكتروني

        مرحباً بك في منصة التبرعات!

        يرجى النقر على الرابط أدناه لتأكيد بريدك الإلكتروني وتفعيل حسابك:
        ${verificationLink}

        هذا الرابط صالح لمدة ساعة واحدة فقط.

        إذا لم تقم بإنشاء حساب في منصة التبرعات، يرجى تجاهل هذه الرسالة.
    `,
  };

  await transporter.sendMail(mailOptions);
};
// --- End Helper Function ---


const registerUser = async (req, res) => {
  try {
    const { email, firstName, lastName, password, dob, termsAccepted } =
      req.body;

    if (!email || !firstName || !lastName || !password || !dob) {
      return res.status(400).json({ message: "جميع الحقول مطلوبة" });
    }

    if (!termsAccepted) {
      return res
        .status(400)
        .json({ message: "يجب الموافقة على الشروط والأحكام وسياسة الخصوصية" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "كلمة السر يجب أن تكون 6 حروف على الأقل" });
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
        .json({ message: "يجب أن يكون العمر 18 سنة أو أكثر" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "هذا الإيميل مسجل من قبل" });
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
    await sendVerificationEmailHelper(user);

    return res.status(201).json({
      message:
        "تم التسجيل بنجاح، يرجى التحقق من بريدك الإلكتروني لتفعيل حسابك.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
};

const verifyEmail = async (req , res) => {
    const {email , token} = req.query;

    try {
        const user = await User.findOne({
            email,
            emailVerificationToken: token,
            emailVerificationTokenExpire: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).send('رابط التحقق غير صالح أو منتهي الصلاحية.');
        }

        user.isVerified = true;
        user.emailVerificationToken = undefined; // Set to undefined to remove the field
        user.emailVerificationTokenExpire = undefined; // Set to undefined

        await user.save();


        res.status(200).send('تم التحقق من بريدك الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول.');
    }
    catch (error) {
        console.error('Email verification error:', error);
        res.status(500).send('فشل التحقق من البريد الإلكتروني. يرجى المحاولة مرة أخرى.');
    }
}

const loginUser = async (req, res) => {
  const block_time = 60 * 5; // Duration in seconds (5 minutes) for blocking an IP

  try {
      const { email, password } = req.body;

      // Helper function to increment Redis counter on failed attempts
      const incrementFailedAttempts = async () => {
          const current = await redis.incr(req.rateLimitKey);
          // If this is the first failed attempt, set an expiry for the key
          if (current === 1) {
              await redis.expire(req.rateLimitKey, block_time);
          }
      };

      // 1. Validate required fields
      if (!email || !password) {
          await incrementFailedAttempts(); // Increment on missing fields
          return res.status(400).json({ message: "جميع الحقول مطلوبة" });
      }

      // 2. Find the user by email
      const existingUser = await User.findOne({ email });

      if (!existingUser) {
          await incrementFailedAttempts(); // Increment on non-existent user
          return res.status(401).json({ message: "الإيميل أو كلمة السر غلط" });
      }

      // 3. Validate password
      const validPassword = await bcrypt.compare(password, existingUser.password);

      if (!validPassword) {
          await incrementFailedAttempts(); // Increment on wrong password
          return res.status(401).json({ message: "الإيميل أو كلمة السر غلط" });
      }

      // 4. Check if user is verified
      if (!existingUser.isVerified) {
          await incrementFailedAttempts(); // Increment on unverified user trying to log in

          // Generate a new verification token and update user
          const newVerificationToken = crypto.randomBytes(32).toString("hex");
          existingUser.emailVerificationToken = newVerificationToken;
          existingUser.emailVerificationTokenExpire = new Date(Date.now() + 3600000); // 1 hour validity
          await existingUser.save(); // Save the user with the new token

          // Send a new verification email
          await sendVerificationEmailHelper(existingUser);

          return res.status(401).json({
              message: "يرجى تفعيل بريدك الإلكتروني لتتمكن من تسجيل الدخول. تم إرسال رابط تحقق جديد إلى بريدك الإلكتروني.",
          });
      }


    existingUser.lastLoginIp = req.ip;
      await existingUser.save()
      // If all checks pass, the login is successful.
      // Clear the rate limit key for this IP.
      await redis.del(req.rateLimitKey);

      // 5. Generate JWT token
      const token = jwt.sign(
          { userId: existingUser._id, email: existingUser.email, type: "user" },
          process.env.JWT_SECRET,
          { expiresIn: "2h" } // JWT expires in 2 hours
      );

      // 6. Set JWT as an HttpOnly cookie
      res.setHeader(
          "Set-Cookie",
          serialize("token", token, {
              httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
              secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
              sameSite: "strict", // Protects against CSRF attacks
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
      return res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
};

const logoutUser = async (req, res) => {
  try {
    // Clear the 'token' cookie by setting an expired cookie
    res.setHeader(
      "Set-Cookie",
      serialize("token", "", { // Set value to empty string
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        sameSite: "strict",
        maxAge: 0, // Set maxAge to 0 to expire the cookie immediately
        expires: new Date(0), // Set expires to a past date (epoch) for immediate expiration
        path: "/",
      })
    );

    return res.status(200).json({ message: "تم تسجيل الخروج بنجاح." });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "فشل تسجيل الخروج." });
  }
};

const sendResetPasswordLink = async (req, res) => {
  try {
    const { email } = req.body;

    // Input validation
    if (!email) {
      return res.status(400).json({ message: "البريد الإلكتروني مطلوب" });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "صيغة البريد الإلكتروني غير صحيحة" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Security best practice: don't confirm if email exists
      return res
        .status(200)
        .json({ message: "إذا كان البريد الإلكتروني مسجلاً لدينا، فستتلقى رابط إعادة تعيين كلمة السر قريباً." });
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
    const emailTemplate = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
                    <h2 style="color: #333; margin-bottom: 20px;">إعادة تعيين كلمة السر</h2>
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                        لقد طلبت إعادة تعيين كلمة السر لحسابك. انقر على الرابط أدناه لإعادة تعيين كلمة السر:
                    </p>
                    <div style="margin: 30px 0;">
                        <a href="${resetLink}"
                           style="background-color: #007bff; color: white; padding: 12px 30px;
                                  text-decoration: none; border-radius: 5px; font-weight: bold;
                                  display: inline-block;">
                            إعادة تعيين كلمة السر
                        </a>
                    </div>
                    <p style="color: #999; font-size: 14px;">
                        هذا الرابط صالح لمدة 30 دقيقة فقط
                    </p>
                    <p style="color: #999; font-size: 14px;">
                        إذا لم تطلب إعادة تعيين كلمة السر، يرجى تجاهل هذه الرسالة
                    </p>
                </div>
            </div>
        `;

    // Send email with error handling
    const mailOptions = {
      from: process.env.FROM_EMAIL || "noreply@tabaroaat.com",
      to: user.email,
      subject: "إعادة تعيين كلمة السر - منصة التبرعات",
      html: emailTemplate,
      // Add text version for better compatibility
      text: `
                إعادة تعيين كلمة السر

                لقد طلبت إعادة تعيين كلمة السر لحسابك.

                استخدم الرابط التالي لإعادة تعيين كلمة السر:
                ${resetLink}

                هذا الرابط صالح لمدة 30 دقيقة فقط.

                إذا لم تطلب إعادة تعيين كلمة السر، يرجى تجاهل هذه الرسالة.
            `,
    };

    await transporter.sendMail(mailOptions);

    // Log successful email send (without sensitive data)
    console.log(`Password reset email sent to: ${email}`);

    return res.status(200).json({
      message: "تم إرسال رابط إعادة تعيين كلمة السر إلى بريدك الإلكتروني",
      tokenExpiry: "30 minutes",
    });
  } catch (error) {
    console.error("Send Reset Password Link error:", error); // Specific error log

    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      return res
        .status(500)
        .json({ message: "خطأ في الاتصال بخدمة البريد الإلكتروني" });
    }

    return res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params; // Assuming token is from URL params

    if (!password || password.length < 6) { // Add password validation
        return res.status(400).json({ message: "كلمة السر الجديدة يجب أن تكون 6 أحرف على الأقل." });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: new Date() }, // Use new Date() for current time
    });

    if (!user) {
      return res
        .status(400) // Changed from 404 to 400 for consistency with "invalid or expired"
        .json({ message: "الرمز غير صالح أو منتهي الصلاحية" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetToken = undefined; // Set to undefined to remove field
    user.resetTokenExpire = undefined; // Set to undefined
    await user.save();

    return res.status(200).json({ message: "تم إعادة تعيين كلمة السر بنجاح" }); // Changed to 200 OK
  } catch (err) {
    console.error("Reset password error:", err); // Log the actual error
    return res.status(500).json({ message: "حدث خطأ في الخادم" }); // Return a server error
  }
};


const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            console.log(`Attempted resend for non-existent email: ${email}`);
            return res.status(200).json({ message: "إذا كان البريد الإلكتروني مسجلاً لدينا، فستتلقى رابط تحقق جديدًا قريبًا." });
        }

        if (user.isVerified) {
            return res.status(200).json({ message: "هذا الحساب تم التحقق منه بالفعل." });
        }

        // Generate new token and set new expiration
        const newVerificationToken = crypto.randomBytes(32).toString("hex");
        user.emailVerificationToken = newVerificationToken;
        user.emailVerificationTokenExpire = new Date(Date.now() + 3600000); // 1 hour validity

        // --- Call the helper function to send verification email ---
        await sendVerificationEmailHelper(user);

        await user.save(); // Save updated user with new token/expiration

        return res.status(200).json({
            message: "تم إرسال رابط التحقق الجديد إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد الخاص بك."
        });

    } catch (err) {
        console.error('Resend verification error:', err);
        return res.status(500).json({ message: "فشل إعادة إرسال رابط التحقق. يرجى المحاولة لاحقاً." });
    }
};

module.exports = {
  registerUser,
  loginUser,
  sendResetPasswordLink,
  resetPassword,
  logoutUser,
  verifyEmail,
  resendVerification
};