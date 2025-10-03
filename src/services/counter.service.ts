import { Prisma, PrismaClient, type Counter } from '@prisma/client';
import { IGlobalResponse, ICounterData, IPagination, IQueueData } from '../interfaces/global.interface';
import { AppError } from '../errors/AppError';

const prisma = new PrismaClient();

// Get All Counters with Pagination
export const SGetAllCounters = async (page: number, limit: number): Promise<IGlobalResponse<ICounterData[]>> => {
    const offset = (page - 1) * limit;
    const [counters, total] = await Promise.all([
        prisma.counter.findMany({
            where: { deletedAt: null },
            select: { id: true, name: true, currentQueue: true, maxQueue: true, isActive: true },
            skip: offset,
            take: limit,
            orderBy: { id: 'asc' }
        }),
        prisma.counter.count({ where: { deletedAt: null } })
    ]);
    
    const pagination: IPagination = {
        total,
        current_page: page,
        per_page: limit,
        total_page: Math.ceil(total / limit)
    };

    return { status: true, message: 'Counters retrieved successfully', data: counters, pagination };
};

// Get Single Counter by ID
export const SGetCounterById = async (id: number): Promise<IGlobalResponse<ICounterData>> => {
    const counter = await prisma.counter.findUnique({
        where: { id, deletedAt: null },
        select: { id: true, name: true, currentQueue: true, maxQueue: true, isActive: true }
    });
    if (!counter) throw new Error("Counter not found");
    return { status: true, message: 'Counter retrieved successfully', data: counter };
};

// Create New Counter
export const SCreateCounter = async (data: Pick<Counter, 'name' | 'maxQueue'>): Promise<IGlobalResponse<ICounterData>> => {
    const newCounter = await prisma.counter.create({
        data: {
            name: data.name,
            maxQueue: data.maxQueue
        }
    });
    return { status: true, message: 'Counter created successfully', data: newCounter };
};

// Update Counter
export const SUpdateCounter = async (id: number, data: Partial<Pick<Counter, 'name' | 'maxQueue'>>): Promise<IGlobalResponse<ICounterData>> => {
    const updatedCounter = await prisma.counter.update({
        where: { id },
        data
    });
    return { status: true, message: 'Counter updated successfully', data: updatedCounter };
};

// Update Counter Status
export const SUpdateCounterStatus = async (id: number, status: 'active' | 'inactive' | 'disable'): Promise<IGlobalResponse<null>> => {
    let dataToUpdate: Partial<Counter> = {};
    if (status === 'active') dataToUpdate = { isActive: true };
    else if (status === 'inactive') dataToUpdate = { isActive: false };
    else if (status === 'disable') dataToUpdate = { deletedAt: new Date() };
    else throw new Error("Invalid status provided");

    await prisma.counter.update({ where: { id }, data: dataToUpdate });
    return { status: true, message: `Counter status updated to ${status}` };
};

// Delete Counter (Soft Delete)
export const SDeleteCounter = async (id: number): Promise<IGlobalResponse<null>> => {
    await prisma.counter.update({
        where: { id },
        data: { deletedAt: new Date() }
    });
    return { status: true, message: 'Counter deleted successfully' };
};

// Next queue
export const SNextQueueForCounter = async (counterId: number): Promise<IGlobalResponse<IQueueData | null>> => {
    const nextQueue = await prisma.queue.findFirst({
        where: {
            counterId: counterId,
            status: 'waiting'
        },
        orderBy: {
            createdAt: 'asc'
        }
    });

    if (!nextQueue) {
        return { status: true, message: 'No waiting queue found for this counter', data: null };
    }

    const updatedQueue = await prisma.queue.update({
        where: { id: nextQueue.id },
        data: { status: 'processing' }
    });

    return { status: true, message: 'Next queue is now processing', data: updatedQueue };
};


// PUBLIC: /current
export const SGetCurrentCounters = async (): Promise<IGlobalResponse<ICounterData[]>> => {
    const counters = await prisma.counter.findMany({
        where: { isActive: true, deletedAt: null },
        select: { id: true, name: true, currentQueue: true, maxQueue: true, isActive: true },
        orderBy: { id: 'asc' }
    });

    return { status: true, message: 'Current counter status retrieved successfully', data: counters };
};

// ADMIN: /reset
export const SResetCounters = async (counterId?: number): Promise<IGlobalResponse<null>> => {
    const whereClause: Prisma.CounterWhereInput = { isActive: true, deletedAt: null };
    if (counterId) {
        whereClause.id = counterId;
    }

    await prisma.$transaction(async (tx) => {
        const countersToReset = await tx.counter.findMany({ where: whereClause });
        if (countersToReset.length === 0) {
            throw AppError.notFound("No active counters found to reset.");
        }
        const idsToReset = countersToReset.map(c => c.id);

        await tx.queue.updateMany({
            where: { counterId: { in: idsToReset }, status: { notIn: ['done', 'cancelled', 'released','skipped'] } },
            data: { status: 'reset' }
        });

        await tx.counter.updateMany({
            where: { id: { in: idsToReset } },
            data: { currentQueue: 0 }
        });
    });

    const message = counterId ? `Counter ${counterId} has been reset.` : "All active counters have been reset.";
    return { status: true, message };
};