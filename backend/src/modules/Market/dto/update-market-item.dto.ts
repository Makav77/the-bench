import { PartialType } from "@nestjs/mapped-types";
import { CreateMarketItemDTO } from "./create-market-item.dto";

export class UpdateMarketItemDTO extends PartialType(CreateMarketItemDTO) { }
