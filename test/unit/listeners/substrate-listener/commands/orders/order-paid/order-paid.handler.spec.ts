import { BlockMetaData } from "../../../../../../../src/listeners/substrate-listener/models/block-metadata.event-model";
import { OrderStatus, TransactionLoggingService } from "../../../../../../../src/common";
import { OrderPaidCommand } from "../../../../../../../src/listeners/substrate-listener/commands/orders";
import { Test, TestingModule } from "@nestjs/testing";
import { escrowServiceMockFactory, MockType, transactionLoggingServiceMockFactory } from "../../../../../mock";
import { OrderPaidHandler } from "../../../../../../../src/listeners/substrate-listener/commands/orders/order-paid/order-paid.handler";
import { EscrowService } from "../../../../../../../src/endpoints/escrow/escrow.service";
import { when } from 'jest-when';
import { ethers } from 'ethers';
import { TransactionLoggingDto } from "../../../../../../../src/common/modules/transaction-logging/dto/transaction-logging.dto";
import { TransactionRequest } from "../../../../../../../src/common/modules/transaction-logging/models/transaction-request.entity";

jest.mock('ethers', () => ({
  ethers: {
    utils: {
      toUtf8String: jest.fn(val=>val)
    },
  },
}));

describe("Order Paid Command Event", () => {
  let orderPaidHandler: OrderPaidHandler;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;
  let escrowServiceMock: MockType<EscrowService>;

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
				{
          provide: EscrowService,
          useFactory: escrowServiceMockFactory
				},
        OrderPaidHandler
      ]
    }).compile();

    orderPaidHandler = module.get(OrderPaidHandler);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    escrowServiceMock = module.get(EscrowService);

    await module.init();
  });

  it("should defined Order Paid Handler", () => {
    expect(orderPaidHandler).toBeDefined();
  });

  it("should not called logging service create", async () => {
    // Arrange
    const toUtf8StringSpy = jest.spyOn(ethers.utils, 'toUtf8String');
    const ORDER = createMockOrder(OrderStatus.Paid);

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
      .calledWith(ORDER.toHuman().id, 2)
      .mockReturnValue(RESULT_STATUS);
    
    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(ORDER.toHuman().id)
      .mockReturnValue(RESULT_TRANSACTION);

    const orderPaidCommand: OrderPaidCommand = new OrderPaidCommand([ORDER], mockBlockNumber());

    await orderPaidHandler.execute(orderPaidCommand);
    expect(transactionLoggingServiceMock.getLoggingByHashAndStatus).toHaveBeenCalled();
    expect(toUtf8StringSpy).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.getLoggingByOrderId).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
  });

  it("should called logging service create", async () => {
    // Arrange
    const toUtf8StringSpy = jest.spyOn(ethers.utils, 'toUtf8String');
    const ORDER = createMockOrder(OrderStatus.Paid);

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
      .calledWith(ORDER.toHuman().id, 2)
      .mockReturnValue(RESULT_STATUS);
    
    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(ORDER.toHuman().id)
      .mockReturnValue(RESULT_TRANSACTION);

    const orderPaidCommand: OrderPaidCommand = new OrderPaidCommand([ORDER], mockBlockNumber());
    
    const orderLogging: TransactionLoggingDto = {
      address: orderPaidCommand.orders.customer_id,
      amount: (Number(orderPaidCommand.orders.additional_prices[0].value) / 10 ** 18) + (Number(orderPaidCommand.orders.prices[0].value) / 10 ** 18),
      created_at: orderPaidCommand.orders.updated_at,
      currency: orderPaidCommand.orders.currency.toUpperCase(),
      parent_id: BigInt(RESULT_TRANSACTION.id),
      ref_number: orderPaidCommand.orders.id,
      transaction_status: 2,
      transaction_type: 1,
    };

    await orderPaidHandler.execute(orderPaidCommand);
    expect(transactionLoggingServiceMock.getLoggingByHashAndStatus).toHaveBeenCalled();
    expect(toUtf8StringSpy).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.getLoggingByOrderId).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalledWith(orderLogging)
  });
});