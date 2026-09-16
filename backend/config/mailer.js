const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpMail = async (email, otp) => {
  const mailOptions = {
    from: `"App Verification" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Registration Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0284c7; text-align: center;">Verify Your Email</h2>
        <p style="color: #334155; font-size: 15px;">Use the verification code below to complete your registration:</p>
        <div style="text-align: center; margin: 25px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a; background: #f1f5f9; padding: 10px 24px; border-radius: 6px; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="color: #64748b; font-size: 13px;">This code will expire in 10 minutes. If you did not request this, please disregard this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendResetPasswordOtpMail = async (email, otp) => {
  const mailOptions = {
    from: `"Security Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #dc2626; text-align: center;">Reset Your Password</h2>
        <p style="color: #334155; font-size: 15px;">You requested a password reset. Use the OTP code below to continue:</p>
        <div style="text-align: center; margin: 25px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a; background: #fef2f2; border: 1px solid #fecaca; padding: 10px 24px; border-radius: 6px; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="color: #64748b; font-size: 13px;">This code will expire in 10 minutes. If you did not make this request, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpMail, sendResetPasswordOtpMail };