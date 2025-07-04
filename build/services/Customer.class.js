"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Customer = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class Customer {
    async hashPassword(password) {
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        return hashedPassword;
    }
    async isPasswordOk(password, BDPassword) {
        const response = await bcrypt_1.default.compare(password, BDPassword);
        if (!response)
            return false;
        return true;
    }
    async verifyEmail() {
    }
    create(data) {
    }
    login(data) {
    }
}
exports.Customer = Customer;
