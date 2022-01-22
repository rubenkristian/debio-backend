import { CommandBus, CqrsModule } from "@nestjs/cqrs";
import { BlockMetaData } from "../../../../../../../src/listeners/substrate-listener/models/block-metadata.event-model";
import { OrderStatus, SubstrateService } from "../../../../../../../src/common";
import { OrderFailedCommand } from "../../../../../../../src/listeners/substrate-listener/commands/orders";
import { Test, TestingModule } from "@nestjs/testing";
import { escrowServiceMockFactory, substrateServiceMockFactory } from "../../../../../mock";
import { OrderFailedHandler } from "../../../../../../../src/listeners/substrate-listener/commands/orders/order-failed/order-failed.handler";
import { EscrowService } from "../../../../../../../src/endpoints/escrow/escrow.service";

describe("Order Failed Command Event", () => {
  let orderFailedHandler: OrderFailedHandler;
  let commandBus: CommandBus;

	function createMockOrder(status: OrderStatus) {
		const first_price = {
			component: "string", 
			value: 1
		};
		const second_price = {
			component: "string", 
			value: 1
		};

		return {
			toHuman: jest.fn(
				() => ({
					id: "string",
					serviceId: "string",
					customerId: "string",
					customerBoxPublicKey: "string",
					sellerId: "string",
					dnaSampleTrackingId: "string",
					currency: 'XX',
					prices: [ first_price ],
					additionalPrices: [ second_price ],
					status: status,
					orderFlow: "1",
					createdAt: "1",
					updatedAt: "1"
				})
			)
		};
	}

	function mockBlockNumber(): BlockMetaData {
		return {
			blockHash: "string",
			blockNumber: 1,
		}
	}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CqrsModule
      ],
      providers: [
        CommandBus,
				{
          provide: SubstrateService,
          useFactory: substrateServiceMockFactory
				},
				{
          provide: EscrowService,
          useFactory: escrowServiceMockFactory
				},
        OrderFailedHandler
      ]
    }).compile();

    orderFailedHandler = module.get(OrderFailedHandler);
    commandBus = module.get(CommandBus);

    await module.init();
  });

  it("should defined Order Failed Handler", () => {
    expect(orderFailedHandler).toBeDefined();
  });

  it("should called order failed handler with command bus", async () => {
    const ORDER = createMockOrder(OrderStatus.Unpaid);

    const orderFailedHandlerSpy = jest.spyOn(orderFailedHandler, 'execute').mockImplementation();

    const orderFailedCommand: OrderFailedCommand = new OrderFailedCommand([ORDER], mockBlockNumber());

    await commandBus.execute(orderFailedCommand);
    expect(orderFailedHandlerSpy).toHaveBeenCalled();
    expect(orderFailedHandlerSpy).toHaveBeenCalledWith(orderFailedCommand);

    orderFailedHandlerSpy.mockClear();
  });
});