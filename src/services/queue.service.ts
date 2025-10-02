import { PrismaClient, type Queue } from "@prisma/client";
import {
    IGlobalResponse,
    IQueueData,
    IPagination,
} from "../interfaces/global.interface";

const prisma = new PrismaClient();

// Get all queues
export const SGetAllQueues = async (
    page: number,
    limit: number,
    counterId?: number
): Promise<IGlobalResponse<IQueueData[]>> => {
    const offset = (page - 1) * limit;

    const whereClause: any = {};

    if (counterId !== undefined) {
        whereClause.counterId = counterId;
    }

    const [queues, total] = await Promise.all([
        prisma.queue.findMany({
            where: whereClause,
            include: { counter: { select: { name: true } } },
            skip: offset,
            take: limit,
            orderBy: { createdAt: "asc" },
        }),
        prisma.queue.count({ where: whereClause }),
    ]);

    const pagination: IPagination = {
        total,
        current_page: page,
        per_page: limit,
        total_page: Math.ceil(total / limit),
    };

    return {
        status: true,
        message: "Queues retrieved succesfully",
        data: queues,
        pagination,
    };
};

// Get single queue by id
export const SGetQueueById = async (
    id: number
): Promise<IGlobalResponse<IQueueData>> => {
    const queue = await prisma.queue.findUnique({
        where: { id },
        include: { counter: { select: { name: true } } },
    });
    if (!queue) throw new Error("Queue not found");
    return { status: true, message: "Queue retrieved successfully", data: queue };
};

// Create New Queue (using Transaction)
export const SCreateQueue = async (data: { counterId: number }): Promise<IGlobalResponse<IQueueData>> => {
    return prisma.$transaction(async (tx) => {
        const counter = await tx.counter.findUnique({
            where: { id: data.counterId }
        });

        if (!counter) throw new Error("Counter not found");
        if (counter.currentQueue >= counter.maxQueue) throw new Error("Counter queue is full");

        const nextQueueNumber = counter.currentQueue + 1;

        const newQueue = await tx.queue.create({
            data: {
                counterId: data.counterId,
                number: nextQueueNumber,
                status: 'waiting'
            }
        });

        await tx.counter.update({
            where: { id: data.counterId },
            data: { currentQueue: nextQueueNumber }
        });

        return { status: true, message: 'Queue created successfully', data: newQueue };
    });
};

// Update queue status
export const SUpdateQueueStatus = async (id: number, status: string): Promise<IGlobalResponse<IQueueData>> => {
    const updatedQueue = await prisma.queue.update({
        where: { id },
        data: { status }
    });
    return { status: true, message: `Queue status updated to ${status}`, data: updatedQueue };
};

// Delete Queue
export const SDeleteQueue = async (id: number): Promise<IGlobalResponse<null>> => {
    await prisma.queue.delete({ where: { id } });
    return { status: true, message: 'Queue deleted permanently' };
};