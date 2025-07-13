function getDeviceVerificationEmailTemplate(lang, code) {
    const templates = {
      ar: {
        subject: "رمز التحقق من الجهاز الجديد - منصة التبرعات",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;" dir="rtl">
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
                  <h2 style="color: #333; margin-bottom: 20px;">رمز التحقق من الجهاز الجديد</h2>
                  <p style="color: #666; font-size: 16px; line-height: 1.6;">
                      مرحباً بك،
                      <br>
                      لقد اكتشفنا محاولة تسجيل دخول من جهاز أو عنوان IP جديد لحسابك.
                      <br>
                      لإكمال تسجيل الدخول، يرجى إدخال رمز التحقق التالي:
                  </p>
                  <div style="margin: 30px 0;">
                      <p style="background-color: #007bff; color: white; padding: 15px 30px;
                                text-decoration: none; border-radius: 5px; font-weight: bold;
                                font-size: 24px; display: inline-block; letter-spacing: 3px;">
                          ${code}
                      </p>
                  </div>
                  <p style="color: #999; font-size: 14px;">
                      هذا الرمز صالح لمدة 10 دقائق فقط.
                  </p>
                  <p style="color: #999; font-size: 14px;">
                      إذا لم تكن أنت من يحاول تسجيل الدخول، يرجى تجاهل هذه الرسالة وتغيير كلمة السر الخاصة بك على الفور.
                  </p>
              </div>
          </div>
        `,
        text: `
  رمز التحقق من الجهاز الجديد
  
  مرحباً بك،
  
  لقد اكتشفنا محاولة تسجيل دخول من جهاز أو عنوان IP جديد لحسابك.
  لإكمال تسجيل الدخول، يرجى إدخال رمز التحقق التالي:
  
  ${code}
  
  هذا الرمز صالح لمدة 10 دقائق فقط.
  
  إذا لم تكن أنت من يحاول تسجيل الدخول، يرجى تجاهل هذه الرسالة وتغيير كلمة السر الخاصة بك على الفور.
        `,
      },
      en: {
        subject: "New Device Verification Code - Tabaroaat Platform",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
                  <h2 style="color: #333; margin-bottom: 20px;">New Device Verification Code</h2>
                  <p style="color: #666; font-size: 16px; line-height: 1.6;">
                      Hello,
                      <br>
                      We detected a login attempt from a new device or IP address for your account.
                      <br>
                      To complete the login, please enter the following verification code:
                  </p>
                  <div style="margin: 30px 0;">
                      <p style="background-color: #007bff; color: white; padding: 15px 30px;
                                text-decoration: none; border-radius: 5px; font-weight: bold;
                                font-size: 24px; display: inline-block; letter-spacing: 3px;">
                          ${code}
                      </p>
                  </div>
                  <p style="color: #999; font-size: 14px;">
                      This code is valid for 10 minutes only.
                  </p>
                  <p style="color: #999; font-size: 14px;">
                      If this wasn’t you, please ignore this message and change your password immediately.
                  </p>
              </div>
          </div>
        `,
        text: `
  New Device Verification Code
  
  Hello,
  
  We detected a login attempt from a new device or IP address for your account.
  To complete the login, please enter the following verification code:
  
  ${code}
  
  This code is valid for 10 minutes only.
  
  If this wasn’t you, please ignore this message and change your password immediately.
        `,
      },
      fr: {
        subject: "Code de vérification du nouvel appareil - Plateforme Tabaroaat",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;" dir="ltr">
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
                  <h2 style="color: #333; margin-bottom: 20px;">Code de vérification du nouvel appareil</h2>
                  <p style="color: #666; font-size: 16px; line-height: 1.6;">
                      Bonjour,
                      <br>
                      Nous avons détecté une tentative de connexion à partir d’un nouvel appareil ou d’une nouvelle adresse IP pour votre compte.
                      <br>
                      Pour terminer la connexion, veuillez saisir le code de vérification suivant :
                  </p>
                  <div style="margin: 30px 0;">
                      <p style="background-color: #007bff; color: white; padding: 15px 30px;
                                text-decoration: none; border-radius: 5px; font-weight: bold;
                                font-size: 24px; display: inline-block; letter-spacing: 3px;">
                          ${code}
                      </p>
                  </div>
                  <p style="color: #999; font-size: 14px;">
                      Ce code est valable pendant 10 minutes seulement.
                  </p>
                  <p style="color: #999; font-size: 14px;">
                      Si ce n’était pas vous, veuillez ignorer ce message et changer immédiatement votre mot de passe.
                  </p>
              </div>
          </div>
        `,
        text: `
  Code de vérification du nouvel appareil
  
  Bonjour,
  
  Nous avons détecté une tentative de connexion à partir d’un nouvel appareil ou d’une nouvelle adresse IP pour votre compte.
  Pour terminer la connexion, veuillez saisir le code de vérification suivant :
  
  ${code}
  
  Ce code est valable pendant 10 minutes seulement.
  
  Si ce n’était pas vous, veuillez ignorer ce message et changer immédiatement votre mot de passe.
        `,
      },
    };
  
    return templates[lang] || templates.en;
  }
  
  module.exports = getDeviceVerificationEmailTemplate;
  