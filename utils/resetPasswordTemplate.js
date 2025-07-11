function getEmailTemplate(lang, resetLink) {
    const templates = {
      ar: {
        subject: "إعادة تعيين كلمة السر - منصة التبرعات",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;" dir="rtl">
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
                  <h2 style="color: #333; margin-bottom: 20px;">إعادة تعيين كلمة السر</h2>
                  <p style="color: #666; font-size: 16px;">لقد طلبت إعادة تعيين كلمة السر لحسابك. انقر على الرابط أدناه لإعادة تعيين كلمة السر:</p>
                  <div style="margin: 30px 0;">
                      <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">إعادة تعيين كلمة السر</a>
                  </div>
                  <p style="color: #999; font-size: 14px;">هذا الرابط صالح لمدة 30 دقيقة فقط</p>
                  <p style="color: #999; font-size: 14px;">إذا لم تطلب إعادة تعيين كلمة السر، يرجى تجاهل هذه الرسالة</p>
              </div>
          </div>
        `,
        text: `
          إعادة تعيين كلمة السر
  
          لقد طلبت إعادة تعيين كلمة السر لحسابك.
          استخدم الرابط التالي لإعادة تعيين كلمة السر:
          ${resetLink}
  
          هذا الرابط صالح لمدة 30 دقيقة فقط.
          إذا لم تطلب إعادة تعيين كلمة السر، يرجى تجاهل هذه الرسالة.
        `,
      },
      en: {
        subject: "Password Reset - Tabaroaat Platform",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
                  <h2 style="color: #333; margin-bottom: 20px;">Password Reset</h2>
                  <p style="color: #666; font-size: 16px;">You requested to reset your password. Click the button below to proceed:</p>
                  <div style="margin: 30px 0;">
                      <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                  </div>
                  <p style="color: #999; font-size: 14px;">This link is valid for 30 minutes only.</p>
                  <p style="color: #999; font-size: 14px;">If you did not request this, please ignore this email.</p>
              </div>
          </div>
        `,
        text: `
          Password Reset
  
          You requested a password reset for your account.
          Use the following link to reset your password:
          ${resetLink}
  
          This link is valid for 30 minutes only.
          If you did not request this, please ignore this message.
        `,
      },
      fr: {
        subject: "Réinitialisation du mot de passe - Plateforme Tabaroaat",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;" dir="ltr">
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
                  <h2 style="color: #333; margin-bottom: 20px;">Réinitialisation du mot de passe</h2>
                  <p style="color: #666; font-size: 16px;">Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour continuer :</p>
                  <div style="margin: 30px 0;">
                      <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Réinitialiser le mot de passe</a>
                  </div>
                  <p style="color: #999; font-size: 14px;">Ce lien est valable pendant 30 minutes seulement.</p>
                  <p style="color: #999; font-size: 14px;">Si vous n’avez pas demandé cette réinitialisation, ignorez ce message.</p>
              </div>
          </div>
        `,
        text: `
          Réinitialisation du mot de passe
  
          Vous avez demandé une réinitialisation de mot de passe.
          Utilisez le lien suivant pour réinitialiser votre mot de passe :
          ${resetLink}
  
          Ce lien est valable pendant 30 minutes seulement.
          Si vous n’avez pas fait cette demande, ignorez ce message.
        `,
      },
    };
  
    // Fallback to English if lang not found
    return templates[lang] || templates["en"];
  }
  

module.exports=  getEmailTemplate