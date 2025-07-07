"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const prisma = new client_1.PrismaClient();
class CustomerService {
    async listOtherUsers(currentUserId) {
        return await prisma.customer.findMany({
            where: {
                id: {
                    not: currentUserId,
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });
    }
    async hashPassword(password) {
        return await bcrypt_1.default.hash(password, 10);
    }
    async isPasswordValid(password, hash) {
        return await bcrypt_1.default.compare(password, hash);
    }
    async register(data) {
        const existing = await prisma.customer.findFirst({
            where: { OR: [{ email: data.email }, { cpf: data.cpf }] }
        });
        if (existing) {
            throw new Error("Email ou CPF já cadastrados.");
        }
        const hashedPassword = await this.hashPassword(data.password);
        const customer = await prisma.customer.create({
            data: {
                ...data,
                password: hashedPassword
            }
        });
        const token = jsonwebtoken_1.default.sign({ id: customer.id }, process.env.JWT_SECRET ?? "eletrotecnica", { expiresIn: "1d" });
        return { token, customer };
    }
    async login(data) {
        const customer = await prisma.customer.findUnique({ where: { email: data.email } });
        if (!customer)
            throw new Error("Usuário não encontrado");
        const valid = await this.isPasswordValid(data.password, customer.password);
        if (!valid)
            throw new Error("Senha inválida");
        const token = jsonwebtoken_1.default.sign({ id: customer.id }, process.env.JWT_SECRET ?? "eletrotecnica", { expiresIn: "1d" });
        return { token, customer };
    }
}
exports.CustomerService = CustomerService;
