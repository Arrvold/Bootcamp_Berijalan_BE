import { PrismaClient, type Admin } from '@prisma/client';
import bcrypt from 'bcrypt';
import { IGlobalResponse, IloginResponse, IAdminData } from '../interfaces/global.interface';
import { UGenerateToken } from '../utils/jwt.util';
import { AppError } from '../errors/AppError';

const prisma = new PrismaClient();

export const SLogin = async (
    usernameOrEmail: string,
    password: string
): Promise<IGlobalResponse<IloginResponse>> => {
    const admin = await prisma.admin.findFirst({
        where: {
            OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
            isActive: true,
            deletedAt: null,
        }
    })

    if (!admin) {
        throw AppError.unauthorized("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if(!isPasswordValid) {
        throw Error("Invalid credentials");
    }

    const token = UGenerateToken(admin);

    const adminResponse: IAdminData = {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
    };

    return {
        status: true,
        message: "Login successful",
        data: {
            admin: adminResponse,
            token: token
        }
    }
}

export const SCreateAdmin = async (
    adminData: Omit<Admin, 'id' | 'isActive' | 'createdAt' | 'updatedAt' | 'deletedAt'>
): Promise<IGlobalResponse<IAdminData>> => {
    const { username, email, name, password } = adminData;

    const existingAdmin = await prisma.admin.findFirst({
        where: {
            OR: [{ username: username }, { email: email }],
            deletedAt: null,
        }
    });

    if (existingAdmin) {
        throw Error("Username or email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.admin.create({
        data: {
            username,
            email,
            password: hashedPassword,
            name,
        }
    })

    const adminResponse: IAdminData = {
        id: newAdmin.id,
        username: newAdmin.username,
        email: newAdmin.email,
        name: newAdmin.name,
    }

    return {
        status: true,
        message: "Admin created successfully",
        data: adminResponse
    }
}


// coba doang
export const SGetAllAdmins = async (): Promise<IGlobalResponse<IAdminData[]>> => {
    const admins = await prisma.admin.findMany({
        select: {
            id: true,
            username: true,
            email: true,
            name: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
        },
        where: {
            deletedAt: null 
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return {
        status: true,
        message: "Admins retrieved successfully",
        data: admins
    }
        
}

export const SUpdateAdmin = async (
    id: number,
    updateData: Partial<Admin>
): Promise<IGlobalResponse<IAdminData>> => {
    const admin = await prisma.admin.findUnique({
        where: { id:id, deletedAt: null }
    });

    if (!admin) {
        throw Error("Admin not found");
    }

    if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedAdmin = await prisma.admin.update({
        where: { id:id },
        data: updateData,
    });

    const adminResponse: IAdminData = {
        id: updatedAdmin.id,
        username: updatedAdmin.username,
        email: updatedAdmin.email,
        name: updatedAdmin.name,
    }

    return {
        status: true,
        message: "Admin updated successfully",
        data: adminResponse
    }
}

export const SDeleteAdmin = async (
    id: number,
) : Promise<IGlobalResponse<null>> => {
    const admin = await prisma.admin.findUnique({
        where: { id:id, deletedAt: null }
    });

    if (!admin) { 
        throw Error("Admin not found");
    }

    await prisma.admin.update({
        where: { id:id },
        data: { deletedAt: new Date() },
    });

    return {
        status: true,
        message: "Admin deleted successfully",
    }
}

export const SGetAdminById = async (id: number): Promise<IGlobalResponse<IAdminData>> => {
    const admin = await prisma.admin.findUnique({
        where: { id, deletedAt: null },
        select: { id: true, username: true, email: true, name: true }
    });
    if (!admin) throw AppError.notFound("Admin not found");
    return { status: true, message: 'Admin retrieved successfully', data: admin };
};

export const SToggleAdminStatus = async (id: number): Promise<IGlobalResponse<{ newStatus: boolean }>> => {
    const admin = await prisma.admin.findUnique({ where: { id } });
    if (!admin) throw AppError.notFound("Admin not found");

    const newStatus = !admin.isActive;
    await prisma.admin.update({
        where: { id },
        data: { isActive: newStatus }
    });
    return { status: true, message: 'Admin status toggled', data: { newStatus } };
};