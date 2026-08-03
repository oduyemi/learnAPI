"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeHtml = void 0;
const escapeHtml = (text) => {
    return text.replace(/[&<>"']/g, (match) => {
        const escapes = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        };
        return escapes[match];
    });
};
exports.escapeHtml = escapeHtml;
