const messages = {
  requiredFields: {
    ar: "جميع الحقول مطلوبة",
    en: "All fields are required",
    fr: "Tous les champs sont obligatoires",
  },
  termsRequired: {
    ar: "يجب الموافقة على الشروط والأحكام وسياسة الخصوصية",
    en: "You must agree to the terms and privacy policy",
    fr: "Vous devez accepter les conditions générales et la politique de confidentialité",
  },
  passwordTooShort: {
    ar: "كلمة السر يجب أن تكون 6 حروف على الأقل",
    en: "Password must be at least 6 characters",
    fr: "Le mot de passe doit comporter au moins 6 caractères",
  },
  ageRequirement: {
    ar: "يجب أن يكون العمر 18 سنة أو أكثر",
    en: "You must be at least 18 years old",
    fr: "Vous devez avoir au moins 18 ans",
  },
  emailAlreadyExists: {
    ar: "هذا الإيميل مسجل من قبل",
    en: "This email is already registered",
    fr: "Cet e-mail est déjà enregistré",
  },
  registrationSuccess: {
    ar: "تم التسجيل بنجاح، يرجى التحقق من بريدك الإلكتروني لتفعيل حسابك.",
    en: "Registration successful. Please verify your email to activate your account.",
    fr: "Inscription réussie. Veuillez vérifier votre e-mail pour activer votre compte.",
  },
  invalidCredentials: {
    ar: "الإيميل أو كلمة السر غلط",
    en: "Invalid email or password",
    fr: "Email ou mot de passe incorrect",
  },
  notVerified: {
    ar: "يرجى تفعيل بريدك الإلكتروني لتتمكن من تسجيل الدخول. تم إرسال رابط تحقق جديد إلى بريدك الإلكتروني.",
    en: "Please verify your email before logging in. A new verification link has been sent.",
    fr: "Veuillez vérifier votre e-mail avant de vous connecter. Un nouveau lien a été envoyé.",
  },
  deviceVerificationSent: {
    ar: "تم الكشف عن جهاز أو عنوان IP جديد. تم إرسال رمز تحقق إلى بريدك الإلكتروني.",
    en: "New device or IP detected. A verification code has been sent to your email.",
    fr: "Un nouvel appareil ou une nouvelle adresse IP a été détecté. Un code de vérification a été envoyé à votre e-mail.",
  },
  logoutSuccess: {
    ar: "تم تسجيل الخروج بنجاح.",
    en: "Logged out successfully.",
    fr: "Déconnexion réussie.",
  },
  emailRequired: {
    ar: "البريد الإلكتروني مطلوب",
    en: "Email is required",
    fr: "L'adresse e-mail est requise",
  },
  invalidEmailFormat: {
    ar: "صيغة البريد الإلكتروني غير صحيحة",
    en: "Invalid email format",
    fr: "Format de l'e-mail invalide",
  },
  resetLinkSent: {
    ar: "تم إرسال رابط إعادة تعيين كلمة السر إلى بريدك الإلكتروني",
    en: "Password reset link sent to your email",
    fr: "Le lien de réinitialisation du mot de passe a été envoyé à votre e-mail",
  },
  invalidResetToken: {
    ar: "الرمز غير صالح أو منتهي الصلاحية",
    en: "The token is invalid or has expired",
    fr: "Le jeton est invalide ou a expiré",
  },
  passwordResetSuccess: {
    ar: "تم إعادة تعيين كلمة السر بنجاح",
    en: "Password reset successfully",
    fr: "Mot de passe réinitialisé avec succès",
  },
  resendVerificationSuccess: {
    ar: "تم إرسال رابط التحقق الجديد إلى بريدك الإلكتروني.",
    en: "A new verification link has been sent to your email.",
    fr: "Un nouveau lien de vérification a été envoyé à votre e-mail.",
  },
  alreadyVerified: {
    ar: "هذا الحساب تم التحقق منه بالفعل.",
    en: "This account has already been verified.",
    fr: "Ce compte a déjà été vérifié.",
  },
  verificationSuccess: {
    ar: "تم التحقق من بريدك الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول.",
    en: "Your email has been verified successfully! You can now log in.",
    fr: "Votre adresse e-mail a été vérifiée avec succès ! Vous pouvez maintenant vous connecter.",
  },
  loginSuccess: {
    ar: "تم تسجيل الدخول بنجاح.",
    en: "Logged in successfully.",
    fr: "Connexion réussie.",
  },
  tokenMissing: {
    ar: "لم يتم العثور على رمز التحقق",
    en: "Token not found",
    fr: "Jeton introuvable",
  },
  loginCheckFailed: {
    ar: "المصادقة فشلت، تم مسح الرمز.",
    en: "Authentication failed, token cleared.",
    fr: "Échec de l'authentification, jeton supprimé.",
  },
  deviceVerified: {
    ar: "تم التحقق من الجهاز بنجاح وتم تسجيل الدخول.",
    en: "Device verified and login successful.",
    fr: "Appareil vérifié et connexion réussie.",
  },
  serverError: {
    ar: "حدث خطأ في الخادم",
    en: "A server error occurred",
    fr: "Une erreur du serveur s'est produite",
  },
  emailVerification : {
    ar: "إذا كان البريد الإلكتروني مسجلاً لدينا، فستتلقى رابط إعادة تعيين كلمة السر قريباً.",
    en: "If the email is registered with us, you will receive a password reset link shortly.",
    fr: "Si l'e-mail est enregistré chez nous, vous recevrez bientôt un lien de réinitialisation du mot de passe."
  }
};

function getMessage(key, lang = "ar") {
  const selectedLang = ["ar", "en", "fr"].includes(lang) ? lang : "ar";
  return (
    messages[key]?.[selectedLang] || messages[key]?.ar || "حدث خطأ غير متوقع"
  );
}

module.exports = getMessage;
