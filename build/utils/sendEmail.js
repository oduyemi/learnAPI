"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetMail = exports.sendOnboardingMail = exports.sendMentorOnboardingMail = exports.sendInstructorOnboardingMail = exports.sendAdminOnboardingMail = exports.sendEmail = void 0;
const tansporter_1 = require("./tansporter");
const escapeHtml_1 = require("./escapeHtml");
const emailLogic_1 = require("./emailLogic");
const sendEmail = async (to, subject, html) => {
    await tansporter_1.transporter.sendMail({
        from: `"ProGrowing Support" <support@progrowing.org>`,
        to,
        subject,
        html,
    });
};
exports.sendEmail = sendEmail;
const sendAdminOnboardingMail = async (recipient, code) => {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Admin Onboarding - ProGrowing Training & Mentorship Community</h2>
      <p>Hi there,</p>
      <p>Welcome onboard! This is your access to the admin dashboard. Please update your password when you're logged in:</p>
      <h1 style="color: #010156;">${(0, escapeHtml_1.escapeHtml)(code)}</h1>
      <p>We look forward to having a great time working together.</p>
      <p>Best regards,<br/>ProGrowing Community</p>
    </div>
  `;
    await (0, emailLogic_1.sendEmailWithRetry)(recipient, "Onboarding for new Administrators", htmlContent);
};
exports.sendAdminOnboardingMail = sendAdminOnboardingMail;
const sendInstructorOnboardingMail = async (recipient, code) => {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Instructor Onboarding - ProGrowing Training & Mentorship Community</h2>
      <p>Hi there,</p>
      <p>Welcome onboard! This is your access to the instructor dashboard. Please update your password when you're logged in:</p>
      <h1 style="color: #010156;">${(0, escapeHtml_1.escapeHtml)(code)}</h1>
      <p>We look forward to having a great time working together.</p>
      <p>Best regards,<br/>ProGrowing Community</p>
    </div>
  `;
    await (0, emailLogic_1.sendEmailWithRetry)(recipient, "Onboarding for new Instructors", htmlContent);
};
exports.sendInstructorOnboardingMail = sendInstructorOnboardingMail;
const sendMentorOnboardingMail = async (recipient, code) => {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Mentor Onboarding - ProGrowing Training & Mentorship Community</h2>
      <p>Hi there,</p>
      <p>Welcome onboard! This is your access to the mentor dashboard. Please update your password when you're logged in:</p>
      <h1 style="color: #010156;">${(0, escapeHtml_1.escapeHtml)(code)}</h1>
      <p>We look forward to having a great time working together.</p>
      <p>Best regards,<br/>ProGrowing Community</p>
    </div>
  `;
    await (0, emailLogic_1.sendEmailWithRetry)(recipient, "Onboarding for new Mentors", htmlContent);
};
exports.sendMentorOnboardingMail = sendMentorOnboardingMail;
const sendOnboardingMail = async (recipient, code) => {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Student LMS Onboarding - ProGrowing Training & Mentorship Community</h2>
      <p>Hi there,</p>
      <p>Welcome onboard! This is your access to the LMS dashboard. Please update your password when you're logged in:</p>
      <h1 style="color: #010156;">${(0, escapeHtml_1.escapeHtml)(code)}</h1>
      <p>We look forward to having a great time working together.</p>
      <p>Best regards,<br/>ProGrowing Community</p>
    </div>
  `;
    await (0, emailLogic_1.sendEmailWithRetry)(recipient, "LMS Onboarding for new Students", htmlContent);
};
exports.sendOnboardingMail = sendOnboardingMail;
const sendPasswordResetMail = async (recipient, resetLink) => {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Password Reset Request</h2>

      <p>Hello,</p>

      <p>
        We received a request to reset your password.
      </p>

      <p>
        Click the button below to choose a new password.
      </p>

      <p style="margin:30px 0;">
        <a
          href="${(0, escapeHtml_1.escapeHtml)(resetLink)}"
          style="
            background:#010156;
            color:white;
            padding:12px 24px;
            text-decoration:none;
            border-radius:6px;
            display:inline-block;
          "
        >
          Reset Password
        </a>
      </p>

      <p>
        This link expires in 15 minutes.
      </p>

      <p>
        If you didn't request this,
        you can safely ignore this email.
      </p>

      <p>
        ProGrowing Training & Mentorship Community
      </p>
    </div>
  `;
    await (0, emailLogic_1.sendEmailWithRetry)(recipient, "Reset your password", htmlContent);
};
exports.sendPasswordResetMail = sendPasswordResetMail;
