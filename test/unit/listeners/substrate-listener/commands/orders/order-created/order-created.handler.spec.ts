import { BlockMetaData } from "../../../../../../../src/listeners/substrate-listener/models/block-metadata.event-model";
import { OrderStatus, TransactionLoggingService } from "../../../../../../../src/common";
import { OrderCreatedCommand } from "../../../../../../../src/listeners/substrate-listener/commands/orders";
import { Test, TestingModule } from "@nestjs/testing";
import { MockType, transactionLoggingServiceMockFactory } from "../../../../../mock";
import { OrderCreatedHandler } from "../../../../../../../src/listeners/substrate-listener/commands/orders/order-created/order-created.handler";
import { when } from 'jest-when';
import { ethers } from 'ethers';
import { TransactionRequest } from "../../../../../../../src/common/modules/transaction-logging/models/transaction-request.entity";

jest.mock('ethers', () => ({
  ethers: {
    utils: {
      toUtf8String: jest.fn(val=>val)
    },
  },
}));

describe("Order Created Handler Event", () => {
  let orderCreatedHandler: OrderCreatedHandler;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;

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
      providers: [
				{
          provide: TransactionLoggingService,
          useFactory: transactionLoggingServiceMockFactory
				},
        OrderCreatedHandler
      ]
    }).compile();

    orderCreatedHandler = module.get(OrderCreatedHandler);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);

    await module.init();
  });

  it("should defined Order Cancelled Handler", () => {
    expect(orderCreatedHandler).toBeDefined();
  });

  it("should not called logging service create", async () => {
    // Arrange
    const toUtf8StringSpy = jest.spyOn(ethers.utils, 'toUtf8String');
    const ORDER = createMockOrder(OrderStatus.Cancelled);

    const RESULT_STATUS = true;
    const RESULT_TRANSACTION: TransactionRequest = new TransactionRequest();
    RESULT_TRANSACTION.id = BigInt(0);
    RESULT_TRANSACTION.address = 'string';
    RESULT_TRANSACTION.amount = 0;
    RESULT_TRANSACTION.created_at = new Date();
    RESULT_TRANSACTION.currency = 'string';
    RESULT_TRANSACTION.parent_id = BigInt(0);
    RESULT_TRANSACTION.ref_number = 'string';
    RESULT_TRANSACTION.transaction_type = 0;
    RESULT_TRANSACTION.transaction_status = 0;
    RESULT_TRANSACTION.transaction_hash = 'string';

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(ORDER.toHuman().id, 1)
      .mockReturnValue(RESULT_STATUS);

    const orderCancelledCommand: OrderCreatedCommand = new OrderCreatedCommand([ORDER], mockBlockNumber());

    await orderCreatedHandler.execute(orderCancelledCommand);
    expect(transactionLoggingServiceMock.getLoggingByHashAndStatus).toHaveBeenCalled();
    expect(toUtf8StringSpy).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
  });

  it("should called logging service create", async () => {
    // Arrange
    const toUtf8StringSpy = jest.spyOn(ethers.utils, 'toUtf8String');
    const ORDER = createMockOrder(OrderStatus.Cancelled);

    const RESULT_STATUS = false;
    const RESULT_TRANSACTION: TransactionRequest = new TransactionRequest();
    RESULT_TRANSACTION.id = BigInt(0);
    RESULT_TRANSACTION.address = 'string';
    RESULT_TRANSACTION.amount = 0;
    RESULT_TRANSACTION.created_at = new Date();
    RESULT_TRANSACTION.currency = 'string';
    RESULT_TRANSACTION.parent_id = BigInt(0);
    RESULT_TRANSACTION.ref_number = 'string';
    RESULT_TRANSACTION.transaction_type = 0;
    RESULT_TRANSACTION.transaction_status = 0;
    RESULT_TRANSACTION.transaction_hash = 'string';

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(ORDER.toHuman().id, 1)
      .mockReturnValue(RESULT_STATUS);

    const orderCancelledCommand: OrderCreatedCommand = new OrderCreatedCommand([ORDER], mockBlockNumber());

    await orderCreatedHandler.execute(orderCancelledCommand);
    expect(transactionLoggingServiceMock.getLoggingByHashAndStatus).toHaveBeenCalled();
    expect(toUtf8StringSpy).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
  });
});