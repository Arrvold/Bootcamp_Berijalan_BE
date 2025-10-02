-- CreateTable
CREATE TABLE "public"."Counter" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "currentQueue" INTEGER NOT NULL DEFAULT 0,
    "maxQueue" INTEGER NOT NULL DEFAULT 99,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Queue" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "counterId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Queue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Queue" ADD CONSTRAINT "Queue_counterId_fkey" FOREIGN KEY ("counterId") REFERENCES "public"."Counter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
