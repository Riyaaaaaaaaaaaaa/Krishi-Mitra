// ============================================================
// EMAIL SERVICE - KRISHI MITRA
// ============================================================
// Handles all email sending functionality including:
// - Email verification
// - Password reset
// - SMTP configuration and initialization
// ============================================================

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  // ============================================================
  // INITIALIZE EMAIL TRANSPORTER
  // ============================================================
  initialize() {
    try {
      // Load email configuration from environment variables
      const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
      const emailPort = parseInt(process.env.EMAIL_PORT || '587');
      const emailSecure = process.env.EMAIL_SECURE === 'true';
      const emailUser = process.env.EMAIL_USER;
      const emailPassword = process.env.EMAIL_PASSWORD;

      // Check if credentials are configured
      if (!emailUser || !emailPassword) {
        console.warn('⚠️  [EmailService] Email credentials not configured. Email sending will be disabled.');
        return;
      }

      // Create nodemailer transporter
      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailSecure,
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      });

      console.log('✅ [EmailService] Initialized successfully');
    } catch (error) {
      console.error('❌ [EmailService] Failed to initialize:', error);
    }
  }

  // ============================================================
  // GENERIC EMAIL SENDER
  // ============================================================
  async sendEmail({ to, subject, html, text }) {
    if (!this.transporter) {
      console.error('❌ [EmailService] Transporter not initialized. Cannot send email.');
      return false;
    }

    try {
      const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@krishimitra.com';

      const info = await this.transporter.sendMail({
        from: emailFrom,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text fallback
      });

      console.log(`✅ [EmailService] Email sent successfully to ${to}: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error(`❌ [EmailService] Failed to send email to ${to}:`, error.message);
      return false;
    }
  }

  // ============================================================
  // SEND VERIFICATION EMAIL (Multilingual)
  // ============================================================
  async sendVerificationEmail(email, code, name, language = 'en') {
    const userName = name || (language === 'hi' ? 'आप' : 'there');
    
    const translations = {
      en: {
        subject: '🔐 Verify Your Krishi Mitra Account',
        header: 'Krishi Mitra',
        tagline: 'Your Smart Agricultural Companion',
        welcome: `Welcome, ${userName}! 👋`,
        thankYou: "Thank you for signing up for Krishi Mitra! We're excited to help you make data-driven farming decisions with AI-powered crop recommendations.",
        verifyPrompt: 'To complete your registration, please verify your email address using the code below:',
        codeLabel: 'Your Verification Code',
        expiresIn: 'This code will expire in <strong>10 minutes</strong> for your security.',
        ignoreText: "If you didn't create an account with Krishi Mitra, you can safely ignore this email.",
        whatYouCanDo: 'What you can do with Krishi Mitra:',
        features: [
          { icon: '🌾', title: 'Smart Crop Recommendations', desc: 'Get AI-powered crop suggestions based on your soil and climate' },
          { icon: '🤖', title: 'AI Assistant', desc: 'Get instant answers to your farming questions in multiple languages' },
          { icon: '📊', title: 'Farm Analytics', desc: 'Track your progress and optimize your farming practices' },
          { icon: '👨‍🌾', title: 'Expert Knowledge', desc: 'Access expert farming tips and best practices' }
        ],
        happyFarming: 'Happy Farming! 🌾',
        copyright: `© ${new Date().getFullYear()} Krishi Mitra. All rights reserved.`
      },
      hi: {
        subject: '🔐 अपना कृषि मित्र खाता सत्यापित करें',
        header: 'कृषि मित्र',
        tagline: 'आपका स्मार्ट कृषि साथी',
        welcome: `स्वागत है, ${userName}! 👋`,
        thankYou: 'कृषि मित्र में साइन अप करने के लिए धन्यवाद! हम AI-संचालित फसल सिफारिशों के साथ आपको डेटा-संचालित खेती के फैसले लेने में मदद करने के लिए उत्सुक हैं।',
        verifyPrompt: 'अपना पंजीकरण पूरा करने के लिए, कृपया नीचे दिए गए कोड का उपयोग करके अपना ईमेल पता सत्यापित करें:',
        codeLabel: 'आपका सत्यापन कोड',
        expiresIn: 'यह कोड आपकी सुरक्षा के लिए <strong>10 मिनट</strong> में समाप्त हो जाएगा।',
        ignoreText: 'यदि आपने कृषि मित्र के साथ खाता नहीं बनाया है, तो आप इस ईमेल को सुरक्षित रूप से अनदेखा कर सकते हैं।',
        whatYouCanDo: 'कृषि मित्र के साथ आप क्या कर सकते हैं:',
        features: [
          { icon: '🌾', title: 'स्मार्ट फसल सिफारिशें', desc: 'अपनी मिट्टी और जलवायु के आधार पर AI-संचालित फसल सुझाव प्राप्त करें' },
          { icon: '🤖', title: 'AI सहायक', desc: 'कई भाषाओं में अपने खेती के प्रश्नों के तत्काल उत्तर प्राप्त करें' },
          { icon: '📊', title: 'खेत विश्लेषण', desc: 'अपनी प्रगति को ट्रैक करें और अपनी खेती प्रथाओं को अनुकूलित करें' },
          { icon: '👨‍🌾', title: 'विशेषज्ञ ज्ञान', desc: 'विशेषज्ञ खेती सुझाव और सर्वोत्तम प्रथाओं तक पहुंचें' }
        ],
        happyFarming: 'शुभ खेती! 🌾',
        copyright: `© ${new Date().getFullYear()} कृषि मित्र. सर्वाधिकार सुरक्षित।`
      }
    };
    
    const t = translations[language] || translations.en;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🌱 ${t.header}</h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">${t.tagline}</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">${t.welcome}</h2>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                ${t.thankYou}
              </p>
              
              <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                ${t.verifyPrompt}
              </p>
              
              <!-- Verification Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <div style="background-color: #dcfce7; border: 2px dashed #16a34a; border-radius: 12px; padding: 20px; display: inline-block;">
                      <p style="margin: 0 0 10px; color: #166534; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${t.codeLabel}</p>
                      <p style="margin: 0; color: #16a34a; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                ⏱️ ${t.expiresIn}
              </p>
              
              <p style="margin: 0 0 30px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                ${t.ignoreText}
              </p>
              
              <!-- Divider -->
              <div style="border-top: 1px solid #e5e7eb; margin: 30px 0;"></div>
              
              <!-- Features Preview -->
              <h3 style="margin: 0 0 20px; color: #1f2937; font-size: 18px; font-weight: 600;">${t.whatYouCanDo}</h3>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                ${t.features.map((feature, idx) => `
                <tr>
                  <td width="30" valign="top" style="padding: 0 0 ${idx < t.features.length - 1 ? '15' : '0'}px;">
                    <span style="font-size: 24px;">${feature.icon}</span>
                  </td>
                  <td valign="top" style="padding: 0 0 ${idx < t.features.length - 1 ? '15' : '0'}px;">
                    <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                      <strong>${feature.title}</strong> - ${feature.desc}
                    </p>
                  </td>
                </tr>
                `).join('')}
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                ${t.happyFarming}
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                ${t.copyright}
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.sendEmail({ to: email, subject: t.subject, html });
  }

  // ============================================================
  // SEND PASSWORD RESET EMAIL
  // ============================================================
  async sendPasswordResetEmail(email, code, name) {
    const userName = name || 'there';
    const subject = '🔑 Reset Your Krishi Mitra Password';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🌱 Krishi Mitra</h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">Password Reset Request</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Hi ${userName},</h2>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password for your Krishi Mitra account.
              </p>
              
              <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Use the verification code below to reset your password:
              </p>
              
              <!-- Reset Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <div style="background-color: #dcfce7; border: 2px dashed #16a34a; border-radius: 12px; padding: 20px; display: inline-block;">
                      <p style="margin: 0 0 10px; color: #166534; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Your Reset Code</p>
                      <p style="margin: 0; color: #16a34a; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                ⏱️ This code will expire in <strong>10 minutes</strong> for your security.
              </p>
              
              <!-- Security Notice -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 0 0 30px;">
                    <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
                      <strong>⚠️ Security Alert:</strong> If you didn't request a password reset, please ignore this email. Your password will remain secure.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <div style="border-top: 1px solid #e5e7eb; margin: 30px 0;"></div>
              
              <!-- Security Tips -->
              <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 16px; font-weight: 600;">🔒 Password Security Tips:</h3>
              
              <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
                <li>Use a strong, unique password (at least 8 characters)</li>
                <li>Include uppercase, lowercase, numbers, and symbols</li>
                <li>Don't reuse passwords from other accounts</li>
                <li>Consider using a password manager</li>
              </ul>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Need help? Contact us at support@krishimitra.com
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Krishi Mitra. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  // ============================================================
  // SEND NOTIFICATION EMAIL (Multilingual)
  // ============================================================
  async sendNotificationEmail(email, notificationData, name, language = 'en') {
    const { type, title, body, data } = notificationData;
    
    const translations = {
      en: {
        subject: `🔔 ${title}`,
        greeting: `Hi ${name || 'there'},`,
        viewDashboard: 'View Dashboard',
        notificationType: 'Notification Type',
        details: 'Details',
        whatToDo: 'What to do next?',
        login: 'Log in to your Krishi Mitra account to view more details and take action.',
        needHelp: 'Need help? Contact us at support@krishimitra.com',
        copyright: `© ${new Date().getFullYear()} Krishi Mitra. All rights reserved.`
      },
      hi: {
        subject: `🔔 ${title}`,
        greeting: `नमस्ते ${name || 'आप'},`,
        viewDashboard: 'डैशबोर्ड देखें',
        notificationType: 'सूचना प्रकार',
        details: 'विवरण',
        whatToDo: 'आगे क्या करें?',
        login: 'अधिक विवरण देखने और कार्रवाई करने के लिए अपने कृषि मित्र खाते में लॉग इन करें।',
        needHelp: 'मदद चाहिए? हमें support@krishimitra.com पर संपर्क करें',
        copyright: `© ${new Date().getFullYear()} कृषि मित्र. सर्वाधिकार सुरक्षित।`
      }
    };

    const t = translations[language] || translations.en;
    const icon = this.getNotificationIcon(type);
    const color = this.getNotificationColor(type);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: ${color}; padding: 40px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">${icon}</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">${title}</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #1f2937; font-size: 18px; font-weight: 600;">${t.greeting}</p>
              
              <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                ${body}
              </p>
              
              ${data && Object.keys(data).length > 0 ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 15px; color: #1f2937; font-size: 14px; font-weight: 600;">${t.details}:</p>
                    ${Object.entries(data).map(([key, value]) => `
                    <p style="margin: 0 0 8px; color: #4b5563; font-size: 14px;">
                      <strong>${key}:</strong> ${value}
                    </p>
                    `).join('')}
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      ${t.viewDashboard}
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <div style="border-top: 1px solid #e5e7eb; margin: 30px 0;"></div>
              
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                ${t.login}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                ${t.needHelp}
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                ${t.copyright}
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.sendEmail({ to: email, subject: t.subject, html });
  }

  // Get notification icon based on type
  getNotificationIcon(type) {
    const icons = {
      priceAlerts: '💰',
      weatherAlerts: '🌧️',
      cropAlerts: '🌾',
      soilAlerts: '🌱',
      default: '🔔'
    };
    return icons[type] || icons.default;
  }

  // Get notification color based on type
  getNotificationColor(type) {
    const colors = {
      priceAlerts: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      weatherAlerts: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      cropAlerts: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
      soilAlerts: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      default: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
    };
    return colors[type] || colors.default;
  }

  // ============================================================
  // TEST SMTP CONNECTION
  // ============================================================
  async testConnection() {
    if (!this.transporter) {
      console.error('❌ [EmailService] Transporter not initialized.');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ [EmailService] Connection test successful');
      return true;
    } catch (error) {
      console.error('❌ [EmailService] Connection test failed:', error.message);
      return false;
    }
  }
}

// ============================================================
// EXPORT SINGLETON INSTANCE
// ============================================================
const emailService = new EmailService();
module.exports = emailService;
