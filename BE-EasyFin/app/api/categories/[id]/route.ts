import { NextRequest, NextResponse } from "next/server";
import { withAuth, JwtPayload } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { TransactionType } from "@prisma/client";
import { z } from "zod";

const updateCategorySchema = z.object({
    name: z.string().min(1, "Tên danh mục là bắt buộc").optional(),
    type: z.enum(["income", "expense"]).optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
});

// Map lowercase type to Prisma enum
const typeMap: Record<string, TransactionType> = {
    income: "INCOME",
    expense: "EXPENSE",
};

/**
 * PUT /api/categories/[id]
 * Update a category
 */
async function handlePut(request: NextRequest, user: JwtPayload, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const body = await request.json();

        // Validate
        const result = updateCategorySchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { success: false, message: result.error.errors[0].message },
                { status: 400 }
            );
        }

        // Check ownership & existence
        const existing = await prisma.category.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, message: "Danh mục không tồn tại" },
                { status: 404 }
            );
        }

        if (existing.userId !== user.userId) {
            return NextResponse.json(
                { success: false, message: "Không có quyền sửa danh mục này (có thể là danh mục hệ thống)" },
                { status: 403 }
            );
        }

        const data: any = { ...result.data };
        if (data.type) {
            data.type = typeMap[data.type];
        }

        const updated = await prisma.category.update({
            where: { id },
            data,
        });

        return NextResponse.json({
            success: true,
            message: "Cập nhật danh mục thành công",
            data: {
                ...updated,
                type: updated.type.toLowerCase() // Return lowercase for frontend
            },
        });

    } catch (error) {
        console.error("Error updating category:", error);
        return NextResponse.json(
            { success: false, message: "Lỗi hệ thống khi cập nhật danh mục" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/categories/[id]
 * Soft delete or hard delete a category
 */
async function handleDelete(request: NextRequest, user: JwtPayload, { params }: { params: { id: string } }) {
    try {
        const id = params.id;

        // Check ownership
        const existing = await prisma.category.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, message: "Danh mục không tồn tại" },
                { status: 404 }
            );
        }

        if (existing.userId !== user.userId) {
            return NextResponse.json(
                { success: false, message: "Không có quyền xóa danh mục này" },
                { status: 403 }
            );
        }

        // Soft delete to preserve transaction history reference potentially
        // Or hard delete if that's the requirement. 
        // Given the schema has isActive, let's use soft delete.
        await prisma.category.update({
            where: { id },
            data: { isActive: false }
        });

        return NextResponse.json({
            success: true,
            message: "Xóa danh mục thành công",
        });

    } catch (error) {
        console.error("Error deleting category:", error);
        return NextResponse.json(
            { success: false, message: "Lỗi hệ thống khi xóa danh mục" },
            { status: 500 }
        );
    }
}

export const PUT = withAuth(handlePut);
export const DELETE = withAuth(handleDelete);
