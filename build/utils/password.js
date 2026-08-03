"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTemporaryPassword = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateTemporaryPassword = (length = 12) => {
    if (length < 8) {
        throw new Error("Password length must be at least 8.");
    }
    const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lowercase = "abcdefghijkmnopqrstuvwxyz";
    const numbers = "23456789";
    const special = "!@#$%&*_-";
    const all = uppercase + lowercase + numbers + special;
    const password = [
        uppercase[crypto_1.default.randomInt(uppercase.length)],
        lowercase[crypto_1.default.randomInt(lowercase.length)],
        numbers[crypto_1.default.randomInt(numbers.length)],
        special[crypto_1.default.randomInt(special.length)],
    ];
    while (password.length < length) {
        password.push(all[crypto_1.default.randomInt(all.length)]);
    }
    for (let i = password.length - 1; i > 0; i--) {
        const j = crypto_1.default.randomInt(i + 1);
        [password[i], password[j]] = [password[j], password[i]];
    }
    return password.join("");
};
exports.generateTemporaryPassword = generateTemporaryPassword;
