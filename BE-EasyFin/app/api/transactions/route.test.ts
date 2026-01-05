/**
 * @jest-environment node
 */
import { GET, POST } from './route';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

// Mock prisma
jest.mock('@/lib/prisma', () => ({
    transaction: {
        findMany: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn(),
        create: jest.fn(),
    },
    category: {
        findFirst: jest.fn(),
        create: jest.fn(),
    },
    account: {
        update: jest.fn(),
    },
}));

// Mock auth
jest.mock('@/lib/auth', () => ({
    withAuth: (handler: any) => handler,
}));

describe('/api/transactions', () => {
    console.log('Test file loaded');
    const mockUser = { userId: 'user-123', email: 'test@example.com', role: 'user' };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST', () => {
        it('should create a transaction successfully', async () => {
            const body = {
                title: 'Test Transaction',
                type: 'expense',
                category: 'Food',
                amount: 100000,
                date: '2023-10-27',
            };

            const req = new NextRequest('http://localhost/api/transactions', {
                method: 'POST',
                body: JSON.stringify(body),
            });

            (prisma.category.findFirst as jest.Mock).mockResolvedValue({ id: 'cat-1' });
            (prisma.transaction.create as jest.Mock).mockResolvedValue({
                id: 'trans-1',
                ...body,
                type: 'EXPENSE',
                amount: 100000,
                date: new Date(body.date),
            });

            const response = await POST(req, mockUser);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(prisma.transaction.create).toHaveBeenCalled();
        });

        it('should return 400 if validation fails', async () => {
            const body = {
                title: '', // Invalid
                type: 'invalid', // Invalid
                category: '', // Invalid
                amount: -100, // Invalid
                date: 'invalid-date', // Invalid
            };

            const req = new NextRequest('http://localhost/api/transactions', {
                method: 'POST',
                body: JSON.stringify(body),
            });

            const response = await POST(req, mockUser);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toBeDefined();
        });
    });
});
