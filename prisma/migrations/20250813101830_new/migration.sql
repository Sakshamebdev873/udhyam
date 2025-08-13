-- CreateTable
CREATE TABLE "public"."Registration" (
    "id" TEXT NOT NULL,
    "aadhaar" VARCHAR(12) NOT NULL,
    "aadhaarMasked" VARCHAR(14) NOT NULL,
    "aadhaarVerified" BOOLEAN NOT NULL DEFAULT false,
    "pan" VARCHAR(10),
    "applicantName" TEXT,
    "mobile" VARCHAR(15),
    "email" TEXT,
    "enterpriseName" TEXT,
    "enterpriseType" TEXT,
    "businessActivity" TEXT,
    "address" TEXT,
    "state" TEXT,
    "district" TEXT,
    "pincode" VARCHAR(10),
    "otpRequestedAt" TIMESTAMP(3),
    "otpVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);
