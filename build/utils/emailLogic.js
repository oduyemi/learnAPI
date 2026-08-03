"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailWithRetry = void 0;
const sendEmail_1 = require("./sendEmail");
const sendEmailWithRetry = async (to, subject, html, retries = 3) => {
    let attempt = 0;
    while (attempt < retries) {
        try {
            await (0, sendEmail_1.sendEmail)(to, subject, html);
            return;
        }
        catch (err) {
            attempt++;
            if (attempt >= retries)
                throw err;
            await new Promise(r => setTimeout(r, 1500));
        }
    }
};
exports.sendEmailWithRetry = sendEmailWithRetry;
