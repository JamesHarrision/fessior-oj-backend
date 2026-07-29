"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const prisma_1 = require("./config/prisma");
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const problem_route_1 = __importDefault(require("./routes/problem.route"));
const submission_route_1 = __importDefault(require("./routes/submission.route"));
const ai_route_1 = __importDefault(require("./routes/ai.route"));
const leaderboard_route_1 = __importDefault(require("./routes/leaderboard.route"));
const room_route_1 = __importDefault(require("./routes/room.route"));
const match_history_route_1 = __importDefault(require("./routes/match_history.route"));
const contest_route_1 = __importDefault(require("./routes/contest.route"));
const comment_route_1 = __importDefault(require("./routes/comment.route"));
const friendship_route_1 = __importDefault(require("./routes/friendship.route"));
const shop_route_1 = __importDefault(require("./routes/shop.route"));
const notification_route_1 = __importDefault(require("./routes/notification.route"));
const report_route_1 = __importDefault(require("./routes/report.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const news_route_1 = __importDefault(require("./routes/news.route"));
const chat_route_1 = __importDefault(require("./routes/chat.route"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_output_json_1 = __importDefault(require("../swagger-output.json"));
const error_middleware_1 = require("./middlewares/error.middleware");
const constants_1 = require("@ocj/constants");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_output_json_1.default));
app.use(`/api/v1${constants_1.API_ROUTES.AUTH}`, auth_route_1.default);
app.use(`/api/v1${constants_1.API_ROUTES.USER}`, user_route_1.default);
app.use(`/api/v1${constants_1.API_ROUTES.PROBLEMS}`, problem_route_1.default);
app.use(`/api/v1${constants_1.API_ROUTES.SUBMISSIONS}`, submission_route_1.default);
app.use(`/api/v1${constants_1.API_ROUTES.AI}`, ai_route_1.default);
app.use(`/api/v1${constants_1.API_ROUTES.LEADERBOARD}`, leaderboard_route_1.default);
app.use(`/api/v1${constants_1.API_ROUTES.ROOMS}`, room_route_1.default);
app.use(`/api/v1${constants_1.API_ROUTES.MATCHES}`, match_history_route_1.default);
app.use(`/api/v1${constants_1.API_ROUTES.CONTESTS}`, contest_route_1.default);
app.use(`/api/v1${constants_1.API_ROUTES.COMMENTS}`, comment_route_1.default);
app.use(`/api/v1${constants_1.API_ROUTES.FRIENDS}`, friendship_route_1.default);
app.use(`/api/v1${constants_1.API_ROUTES.SHOP}`, shop_route_1.default);
app.use(`/api/v1${constants_1.API_ROUTES.NOTIFICATIONS}`, notification_route_1.default);
app.use(`/api/v1${constants_1.API_ROUTES.REPORTS}`, report_route_1.default);
app.use('/api/v1/news', news_route_1.default);
app.use('/api/v1/chat', chat_route_1.default);
app.get('/', async (req, res) => {
    const userCount = await prisma_1.prisma.user.count();
    return res.status(200).json({
        status: "Success",
        message: "Welcome x 3.14",
        userCount
    });
});
// Global error handler middleware should be at the end of route declarations
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
