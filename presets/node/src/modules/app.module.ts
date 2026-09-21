import { Module } from "@nestjs/common";

import { GreetController } from "@/controllers/greet.controller";

@Module({ controllers: [GreetController] })
export class AppModule {}
