-- CreateTable
CREATE TABLE "code_indexes" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "index_data" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "code_indexes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "code_indexes_project_id_key" ON "code_indexes"("project_id");

-- CreateIndex
CREATE INDEX "code_indexes_project_id_idx" ON "code_indexes"("project_id");

-- CreateIndex
CREATE INDEX "code_indexes_version_idx" ON "code_indexes"("version");

-- AddForeignKey
ALTER TABLE "code_indexes" ADD CONSTRAINT "code_indexes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
