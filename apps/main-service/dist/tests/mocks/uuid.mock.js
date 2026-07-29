"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.v4 = void 0;
const crypto_1 = __importDefault(require("crypto"));
const v4 = () => crypto_1.default.randomUUID();
exports.v4 = v4;
