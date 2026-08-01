"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTemporaryPassword = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateTemporaryPassword = (length = 10) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars[crypto_1.default.randomInt(chars.length)];
    }
    return password;
};
exports.generateTemporaryPassword = generateTemporaryPassword;
