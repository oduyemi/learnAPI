"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseThumbnail = exports.uploadProfileImage = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinaryStorage_1 = require("../utils/cloudinaryStorage");
exports.uploadProfileImage = (0, multer_1.default)({
    storage: cloudinaryStorage_1.profileImageStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
exports.courseThumbnail = (0, multer_1.default)({
    storage: cloudinaryStorage_1.courseThumbnailStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
