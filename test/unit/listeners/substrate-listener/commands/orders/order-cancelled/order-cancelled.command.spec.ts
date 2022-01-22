import { CommandBus, CqrsModule } from "@nestjs/cqrs";
import { BlockMetaData } from "../../../../../../../src/listeners/substrate-listener/models/block-metadata.event-model";
import { OrderStatus, TransactionLoggingService } from "../../../../../../../src/common";
import { OrderCancelledCommand } from "../../../../../../../src/listeners/substrate-listener/commands/orders";
import { Test, TestingModule } from "@nestjs/testing";
import { escrowServiceMockFactory, transactionLoggingServiceMockFactory } from "../../../../../mock";
import { OrderCancelledHandler } from "../../../../../../../src/listeners/substrate-listener/commands/orders/order-cancelled/order-cancelled.handler";
import { EscrowService } from "../../../../../../../src/endpoints/escrow/escrow.service";

describe("Order Cancelled Command Event", () => {
  let orderCancelledHandler: OrderCancelledHandler;
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
          provide: TransactionLoggingService,
          useFactory: transactionLoggingServiceMockFactory
				},
				{
          provide: EscrowService,
          useFactory: escrowServiceMockFactory
				},
        OrderCancelledHandler
      ]
    }).compile();

    orderCancelledHandler = module.get(OrderCancelledHandler);
    commandBus = module.get(CommandBus);

    await module.init();
  });

  it("should defined Order Cancelled Handler", () => {
    expect(orderCancelledHandler).toBeDefined();
  });

  it("should called order cancelled handler with command bus", async () => {
    const ORDER = createMockOrder(OrderStatus.Cancelled);

    const orderCancelledHandlerSpy = jest.spyOn(orderCancelledHandler, 'execute').mockImplementation();

    const orderCancelledCommand: OrderCancelledCommand = new OrderCancelledCommand([ORDER], mockBlockNumber());

    await commandBus.execute(orderCancelledCommand);
    expect(orderCancelledHandlerSpy).toHaveBeenCalled();
    expect(orderCancelledHandlerSpy).toHaveBeenCalledWith(orderCancelledCommand);

    orderCancelledHandlerSpy.mockClear();
  });
});