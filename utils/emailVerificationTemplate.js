const emailTemplates = {
    getVerificationEmail(lang = 'en', link) {
      const templates = {
        ar: {
          subject: "تأكيد بريدك الإلكتروني - منصة التبرعات",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;" dir="rtl">
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
                <h2 style="color: #333; margin-bottom: 20px;">تأكيد بريدك الإلكتروني</h2>
                <p style="color: #666; font-size: 16px;">مرحباً بك في منصة التبرعات! لإكمال تسجيل حسابك، يرجى النقر على الرابط التالي:</p>
                <div style="margin: 30px 0;">
                  <a href="${link}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">تأكيد البريد الإلكتروني</a>
                </div>
                <p style="color: #999; font-size: 14px;">هذا الرابط صالح لمدة ساعة واحدة فقط.</p>
              </div>
            </div>
          `,
          text: `
            تأكيد بريدك الإلكتروني
  
            يرجى النقر على الرابط التالي لتأكيد بريدك:
            ${link}
  
            هذا الرابط صالح لمدة ساعة واحدة فقط.
          `,
        },
        en: {
          subject: "Email Verification - Tabaroaat Platform",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
                <h2 style="color: #333; margin-bottom: 20px;">Email Verification</h2>
                <p style="color: #666; font-size: 16px;">Welcome to Tabaroaat! To complete your registration, please click the link below:</p>
                <div style="margin: 30px 0;">
                  <a href="${link}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
                </div>
                <p style="color: #999; font-size: 14px;">This link is valid for 1 hour only.</p>
              </div>
            </div>
          `,
          text: `
            Email Verification
  
            Please click the following link to verify your email:
            ${link}
  
            This link is valid for 1 hour only.
          `,
        },
        fr: {
          subject: "Vérification de l'e-mail - Plateforme Tabaroaat",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
                <h2 style="color: #333; margin-bottom: 20px;">Vérification de l'e-mail</h2>
                <p style="color: #666; font-size: 16px;">Bienvenue sur Tabaroaat ! Pour terminer votre inscription, cliquez sur le lien ci-dessous :</p>
                <div style="margin: 30px 0;">
                  <a href="${link}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Vérifier l'e-mail</a>
                </div>
                <p style="color: #999; font-size: 14px;">Ce lien est valable pendant 1 heure seulement.</p>
              </div>
            </div>
          `,
          text: `
            Vérification de l'e-mail
  
            Cliquez sur le lien suivant pour vérifier votre adresse e-mail :
            ${link}
  
            Ce lien est valable pendant 1 heure seulement.
          `,
        },
      };
  
      return templates[lang] || templates.en;
    }
  };
  
  module.exports = emailTemplates;
  