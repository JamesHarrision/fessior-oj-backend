import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Fessior API Document',
    description: 'Tài liệu API cho hệ thống Online Code Judge',
    version: '1.0.0',
  },
  host: process.env.SWAGGER_HOST || 'localhost:6868',
  schemes: process.env.NODE_ENV === 'production' ? ['https'] : ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Nhập Token theo định dạng: Bearer <Access_Token>'
    }
  }
};

const outputFile = './swagger-output.json';
const endpointsFiles = [
    './src/routes/ai.route.ts',
    './src/routes/auth.route.ts',
    './src/routes/comment.route.ts',
    './src/routes/contest.route.ts',
    './src/routes/friendship.route.ts',
    './src/routes/leaderboard.route.ts',
    './src/routes/match_history.route.ts',
    './src/routes/notification.route.ts',
    './src/routes/problem.route.ts',
    './src/routes/report.route.ts',
    './src/routes/shop.route.ts',
    './src/routes/submission.route.ts',
];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc);