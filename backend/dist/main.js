"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const isProd = process.env.NODE_ENV === 'production';
    app.enableCors({
        origin: isProd
            ? true
            : ['http://localhost:5173', 'http://localhost:3000'],
        credentials: true,
    });
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Backend rodando na porta ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map