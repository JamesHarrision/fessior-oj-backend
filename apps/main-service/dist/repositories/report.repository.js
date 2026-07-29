"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportRepository = exports.ReportRepository = void 0;
const prisma_1 = require("../config/prisma");
const client_1 = require("@prisma/client");
class ReportRepository {
    async create(data) {
        return prisma_1.prisma.report.create({
            data: {
                user_id: data.userId,
                type: data.type,
                content: data.content,
                reported_user_id: data.reportedUserId || null,
                problem_id: data.problemId || null,
                status: client_1.ReportStatus.PENDING,
            },
        });
    }
    async findList(filter) {
        const skip = (filter.page - 1) * filter.limit;
        const whereClause = {};
        if (filter.userId) {
            whereClause.user_id = filter.userId;
        }
        if (filter.status) {
            whereClause.status = filter.status;
        }
        const [total, items] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.report.count({ where: whereClause }),
            prisma_1.prisma.report.findMany({
                where: whereClause,
                skip,
                take: filter.limit,
                orderBy: { created_at: 'desc' },
            }),
        ]);
        return {
            total,
            page: filter.page,
            limit: filter.limit,
            items,
        };
    }
    async findById(id) {
        return prisma_1.prisma.report.findUnique({
            where: { id },
        });
    }
    async updateStatus(id, status) {
        return prisma_1.prisma.report.update({
            where: { id },
            data: {
                status,
            },
        });
    }
}
exports.ReportRepository = ReportRepository;
exports.reportRepository = new ReportRepository();
