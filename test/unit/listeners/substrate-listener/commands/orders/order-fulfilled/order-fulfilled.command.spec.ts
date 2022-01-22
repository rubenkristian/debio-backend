import { CommandBus, CqrsModule } from "@nestjs/cqrs";
import { BlockMetaData } from "../../../../../../../src/listeners/substrate-listener/models/block-metadata.event-model";
import { DebioConversionService, OrderStatus, RewardService, SubstrateService, TransactionLoggingService } from "../../../../../../../src/common";
import { OrderFulfilledCommand } from "../../../../../../../src/listeners/substrate-listener/commands/orders";
import { Test, TestingModule } from "@nestjs/testing";
import { debioConversionServiceMockFactory, escrowServiceMockFactory, rewardServiceMockFactory, substrateServiceMockFactory, transactionLoggingServiceMockFactory } from "../../../../../mock";
import { OrderFulfilledHandler } from "../../../../../../../src/listeners/substrate-listener/commands/orders/order-fulfilled/order-fulfilled.handler";
import { EscrowService } from "../../../../../../../src/endpoints/escrow/escrow.service";

describe("Order Fulfilled Command Event", () => {
  let orderFulfilledHandler: OrderFulfilledHandler;
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
				{
          provide: SubstrateService,
          useFactory: substrateServiceMockFactory
				},
        {
          provide: DebioConversionService,
          useFactory: debioConversionServiceMockFactory
        },
        {
          provide: RewardService,
          useFactory: rewardServiceMockFactory
        },
        OrderFulfilledHandler
      ]
    }).compile();

    orderFulfilledHandler = module.get(OrderFulfilledHandler);
    commandBus = module.get(CommandBus);

    await module.init();
  });

  it("should defined Order Fulfilled Handler", () => {
    expect(orderFulfilledHandler).toBeDefined();
  });

  it("should called order fulfilled handler with command bus", async () => {
    const ORDER = createMockOrder(OrderStatus.Unpaid);

    const orderFulfilledHandlerSpy = jest.spyOn(orderFulfilledHandler, 'execute').mockImplementation();

    const orderFulfilledCommand: OrderFulfilledCommand = new OrderFulfilledCommand([ORDER], mockBlockNumber());

    await commandBus.execute(orderFulfilledCommand);
    expect(orderFulfilledHandlerSpy).toHaveBeenCalled();
    expect(orderFulfilledHandlerSpy).toHaveBeenCalledWith(orderFulfilledCommand);

    orderFulfilledHandlerSpy.mockClear();
  });
});