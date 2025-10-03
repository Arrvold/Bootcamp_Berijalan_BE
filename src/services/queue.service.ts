import { PrismaClient, type Queue } from "@prisma/client";
import {
    IGlobalResponse,
    IQueueData,
    IPagination,
} from "../interfaces/global.interface";
import { AppError } from "../errors/AppError";

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

// PUBLIC: /claim
export const SClaimQueue = async (): Promise<IGlobalResponse<IQueueData>> => {
    // Cari loket yang paling sepi
    const targetCounter = await prisma.counter.findFirst({
        where: { isActive: true, deletedAt: null },
        orderBy: { currentQueue: 'asc' },
    });

    if (!targetCounter) {
        throw AppError.notFound("No active counters available.");
    }
    if (targetCounter.currentQueue >= targetCounter.maxQueue) {
        throw new AppError("All counters are currently full.", 429); // 429 Too Many Requests
    }

    // Gunakan transaksi untuk membuat antrian di loket yang terpilih
    return prisma.$transaction(async (tx) => {
        const nextQueueNumber = targetCounter.currentQueue + 1;

        const newQueue = await tx.queue.create({
            data: {
                counterId: targetCounter.id,
                number: nextQueueNumber,
                status: 'waiting'
            },
            include: { counter: { select: { name: true } } }
        });

        await tx.counter.update({
            where: { id: targetCounter.id },
            data: { currentQueue: nextQueueNumber }
        });

        return { status: true, message: 'Queue claimed successfully', data: newQueue };
    });
};

// PUBLIC: /release
export const SReleaseQueue = async (id: number): Promise<IGlobalResponse<null>> => {
    const queue = await prisma.queue.findUnique({ where: { id } });

    if (!queue) {
        throw AppError.notFound("Queue not found.");
    }
    if (queue.status !== 'waiting') {
        throw AppError.badRequest(`Cannot release a queue with status '${queue.status}'.`);
    }

    await prisma.queue.update({
        where: { id },
        data: { status: 'released' }
    });

    return { status: true, message: "Queue has been released." };
};

// ADMIN: /next/:counter_id
export const SNextQueue = async (counterId: number): Promise<IGlobalResponse<IQueueData | null>> => {
    const nextQueue = await prisma.queue.findFirst({
        where: { counterId, status: 'waiting' },
        orderBy: { createdAt: 'asc' },
        include: { counter: { select: { name: true } } }
    });

    if (!nextQueue) {
        return { status: true, message: 'No more waiting queues for this counter.', data: null };
    }

    const calledQueue = await prisma.queue.update({
        where: { id: nextQueue.id },
        data: { status: 'called' },
        include: { counter: { select: { name: true } } }
    });

    return { status: true, message: 'Next queue has been called.', data: calledQueue };
};

// ADMIN: /skip/:counter_id
export const SSkipQueue = async (counterId: number): Promise<IGlobalResponse<IQueueData | null>> => {
    return prisma.$transaction(async (tx) => {
        const currentCalledQueue = await tx.queue.findFirst({
            where: { counterId, status: 'called' },
        });

        if (currentCalledQueue) {
            await tx.queue.update({
                where: { id: currentCalledQueue.id },
                data: { status: 'skipped' }
            });
        }

        // Coba panggil antrian berikutnya
        const nextQueue = await tx.queue.findFirst({
            where: { counterId, status: 'waiting' },
            orderBy: { createdAt: 'asc' },
            include: { counter: { select: { name: true } } }
        });

        if (!nextQueue) {
            return { status: true, message: 'Current queue skipped. No more waiting queues.', data: null };
        }

        const newCalledQueue = await tx.queue.update({
            where: { id: nextQueue.id },
            data: { status: 'called' },
            include: { counter: { select: { name: true } } }
        });

        return { status: true, message: 'Current queue skipped, next queue called.', data: newCalledQueue };
    });
};

export const SGetQueueMetrics = async (): Promise<IGlobalResponse<any>> => {
    const metrics = await prisma.queue.groupBy({
        by: ['status'],
        _count: {
            status: true,
        },
    });

    const formattedMetrics = { waiting: 0, called: 0, processing: 0, skipped: 0, done: 0 };
    metrics.forEach(item => {
        if (item.status in formattedMetrics) {
            formattedMetrics[item.status as keyof typeof formattedMetrics] = item._count.status;
        }
    });

    return { status: true, message: 'Metrics retrieved', data: formattedMetrics };
};