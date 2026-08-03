"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAppointmentBooking = void 0;
const escapeHtml_1 = require("./escapeHtml");
const emailLogic_1 = require("./emailLogic");
const sendAppointmentBooking = async (recipient, body) => {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>New Appointment Booked</h2>

      <p>Someone just booked an appointment from your website.</p>

      <hr />

      <p><strong>Name:</strong> ${(0, escapeHtml_1.escapeHtml)(body.fullname)}</p>
      <p><strong>Email:</strong> ${(0, escapeHtml_1.escapeHtml)(body.email)}</p>
      <p><strong>Phone:</strong> ${(0, escapeHtml_1.escapeHtml)(body.phone)}</p>
      <p><strong>Proposed Appointment Date:</strong> ${(0, escapeHtml_1.escapeHtml)(body.proposedDate)}</p>
      <p><strong>Service:</strong> ${(0, escapeHtml_1.escapeHtml)(body.service)}</p>
      

      <hr />

      <p><strong>Message:</strong></p>
      <p><strong>Additional Notes:</strong> ${(0, escapeHtml_1.escapeHtml)(body.additionalNotes)}</p>

      <hr />

      <p>Best regards,<br />Book Appointment Form</p>
    </div>
  `;
    await (0, emailLogic_1.sendEmailWithRetry)(recipient, `New Appointment Booked for ${body.proposedDate}`, htmlContent);
};
exports.sendAppointmentBooking = sendAppointmentBooking;
