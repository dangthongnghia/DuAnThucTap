import { NextRequest, NextResponse } from "next/server";
import { withAuth, JwtPayload } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function handlePost(request: NextRequest, user: JwtPayload) {
    try {
        const body = await request.json();
        const { ids } = body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Danh sách ID không hợp lệ",
                },
                { status: 400 }
            );
        }

        // Fetch transactions first to handle balance updates
        const transactions = await prisma.transaction.findMany({
            where: {
                id: { in: ids },
                userId: user.userId,
            },
            select: {
                id: true,
                amount: true,
                type: true,
                accountId: true,
            },
        });

        if (transactions.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Không tìm thấy giao dịch nào để xóa",
                },
                { status: 404 }
            );
        }

        // Group by accountId to update balances
        const accountUpdates: Record<string, number> = {};

        for (const transaction of transactions) {
            if (transaction.accountId) {
                const amount = Number(transaction.amount);
                const isIncome = transaction.type === "INCOME";
                // Revert: subtract income, add expense
                const balanceChange = isIncome ? -amount : amount;

                accountUpdates[transaction.accountId] = (accountUpdates[transaction.accountId] || 0) + balanceChange;
            }
        }

        // Execute updates in transaction
        await prisma.$transaction(async (tx) => {
            // Update balances
            for (const [accountId, change] of Object.entries(accountUpdates)) {
                await tx.account.update({
                    where: { id: accountId },
                    data: {
                        balance: { increment: change }
                    }
                });
            }

            // Delete transactions
            await tx.transaction.deleteMany({
                where: {
                    id: { in: transactions.map(t => t.id) } // Only delete what we found/authorized
                }
            });
        });

        return NextResponse.json({
            success: true,
            message: `Đã xóa ${transactions.length} giao dịch`,
            data: {
                deletedCount: transactions.length,
            },
        });
    } catch (error) {
        console.error("Error deleting multiple transactions:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Đã xảy ra lỗi khi xóa giao dịch",
            },
            { status: 500 }
        );
    }
}

export const POST = withAuth(handlePost);
