import { Controller, Get, Param } from "@nestjs/common";

import { greet } from "@/services/greet";

type GreetPath = { name: string };

@Controller("greet")
export class GreetController {
  @Get(":name")
  show(@Param() path: GreetPath): { message: string } {
    return { message: greet(path.name) };
  }
}
