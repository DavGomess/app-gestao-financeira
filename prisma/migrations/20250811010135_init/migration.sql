-- CreateTable
CREATE TABLE "public"."ContasPagar" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "categoria" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContasPagar_pkey" PRIMARY KEY ("id")
);
