import { Module } from "@nestjs/common";
import { IrisController } from "./iris.controller";
import { IrisService } from "./iris.service";

@Module({
    controllers: [IrisController],
    providers: [IrisService],
    exports: [IrisService],
})

export class IrisModule {}
