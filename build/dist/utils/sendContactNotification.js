"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendContactSubmission = void 0;
const escapeHtml_1 = require("./escapeHtml");
const emailLogic_1 = require("./emailLogic");
const sendContactSubmission = async (recipient, body) => {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>New Contact Form Submission</h2>

      <p>You've received a new contact form submission from your website.</p>

      <hr />

      <p><strong>Name:</strong> ${(0, escapeHtml_1.escapeHtml)(body.fullname)}</p>
      <p><strong>Email:</strong> ${(0, escapeHtml_1.escapeHtml)(body.email)}</p>
      <p><strong>Phone:</strong> ${(0, escapeHtml_1.escapeHtml)(body.phone)}</p>
      <p><strong>Subject:</strong> ${(0, escapeHtml_1.escapeHtml)(body.subject)}</p>

      <hr />

      <p><strong>Message:</strong></p>
      <p>${(0, escapeHtml_1.escapeHtml)(body.message)}</p>

      <hr />

      <p>Best regards,<br />Website Contact Form</p>
    </div>
  `;
    await (0, emailLogic_1.sendEmailWithRetry)(recipient, `New Contact Form Submission: ${body.subject}`, htmlContent);
};
exports.sendContactSubmission = sendContactSubmission;
