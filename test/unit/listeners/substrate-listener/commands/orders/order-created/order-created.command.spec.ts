import { CommandBus, CqrsModule } from "@nestjs/cqrs";
import { BlockMetaData } from "../../../../../../../src/listeners/substrate-listener/models/block-metadata.event-model";
import { OrderStatus, TransactionLoggingService } from "../../../../../../../src/common";
import { OrderCreatedCommand } from "../../../../../../../src/listeners/substrate-listener/commands/orders";
import { Test, TestingModule } from "@nestjs/testing";
import { transactionLoggingServiceMockFactory } from "../../../../../mock";
import { OrderCreatedHandler } from "../../../../../../../src/listeners/substrate-listener/commands/orders/order-created/order-created.handler";

describe("Order Created Command Event", () => {
  let orderCreatedHandler: OrderCreatedHandler;
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
        OrderCreatedHandler
      ]
    }).compile();

    orderCreatedHandler = module.get(OrderCreatedHandler);
    commandBus = module.get(CommandBus);

    await module.init();
  });

  it("should defined Order Created Handler", () => {
    expect(orderCreatedHandler).toBeDefined();
  });

  it("should called order created handler with command bus", async () => {
    const ORDER = createMockOrder(OrderStatus.Unpaid);

    const orderCreatedHandlerSpy = jest.spyOn(orderCreatedHandler, 'execute').mockImplementation();

    const orderCreatedCommand: OrderCreatedCommand = new OrderCreatedCommand([ORDER], mockBlockNumber());

    await commandBus.execute(orderCreatedCommand);
    expect(orderCreatedHandlerSpy).toHaveBeenCalled();
    expect(orderCreatedHandlerSpy).toHaveBeenCalledWith(orderCreatedCommand);

    orderCreatedHandlerSpy.mockClear();
  });
});