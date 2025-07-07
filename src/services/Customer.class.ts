import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config();

const prisma = new PrismaClient();

export class CustomerService {

  public async listOtherUsers(currentUserId: number) {
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

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  private async isPasswordValid(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  public async register(data: {
    name: string;
    email: string;
    password: string;
    cpf: string;
  }) {
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

    const token = jwt.sign({ id: customer.id }, process.env.JWT_SECRET! ?? "eletrotecnica", { expiresIn: "1d" });

    return { token, customer };
  }

  public async login(data: { email: string; password: string }) {
    const customer = await prisma.customer.findUnique({ where: { email: data.email } });

    if (!customer) throw new Error("Usuário não encontrado");

    const valid = await this.isPasswordValid(data.password, customer.password);
    if (!valid) throw new Error("Senha inválida");

    const token = jwt.sign({ id: customer.id }, process.env.JWT_SECRET! ?? "eletrotecnica", { expiresIn: "1d" });

    return { token, customer };
  }
}
