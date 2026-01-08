import { NextRequest, NextResponse } from "next/server";
import { withAuth, JwtPayload } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { TransactionType } from "@prisma/client";
import { z } from "zod";

const createCategorySchema = z.object({
    name: z.string().min(1, "Tên danh mục là bắt buộc"),
    type: z.enum(["income", "expense"], {
        errorMap: () => ({ message: "Loại giao dịch không hợp lệ" }),
    }),
    icon: z.string().optional(),
    color: z.string().optional(),
});

// Map lowercase type to Prisma enum
const typeMap: Record<string, TransactionType> = {
    income: "INCOME",
    expense: "EXPENSE",
};

/**
 * GET /api/categories
 * Lấy danh sách danh mục (System default + User custom)
 */
async function handleGet(request: NextRequest, user: JwtPayload) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type") as "income" | "expense" | null;

        const where: any = {
            OR: [
                { isSystem: true },
                { userId: user.userId },
            ],
            isActive: true,
        };

        if (type && typeMap[type]) {
            where.type = typeMap[type];
        }

        const categories = await prisma.category.findMany({
            where,
            orderBy: [
                { isSystem: 'desc' },
                { name: 'asc' }
            ]
        });

        return NextResponse.json({
            success: true,
            data: categories.map(c => ({
                ...c,
                type: c.type.toLowerCase(),
            })),
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            { success: false, message: "Lỗi hệ thống khi lấy danh mục" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/categories
 * Tạo danh mục mới
 */
async function handlePost(request: NextRequest, user: JwtPayload) {
    try {
        const body = await request.json();
        const result = createCategorySchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: result.error.errors[0].message,
                },
                { status: 400 }
            );
        }

        const { name, type, icon, color } = result.data;
        const transactionType = typeMap[type];

        // Check duplicate custom category
        const existing = await prisma.category.findFirst({
            where: {
                userId: user.userId,
                name: name,
                type: transactionType,
                isActive: true
            }
        });

        if (existing) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Danh mục đã tồn tại",
                },
                { status: 409 }
            );
        }

        const category = await prisma.category.create({
            data: {
                userId: user.userId,
                name,
                type: transactionType,
                icon,
                color,
                isSystem: false,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Tạo danh mục thành công",
            data: {
                ...category,
                type: category.type.toLowerCase()
            },
        }, { status: 201 });

    } catch (error) {
        console.error("Error creating category:", error);
        return NextResponse.json(
            { success: false, message: "Lỗi hệ thống khi tạo danh mục" },
            { status: 500 }
        );
    }
}

export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost);
