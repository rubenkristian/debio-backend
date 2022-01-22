import { BlockMetaData } from "../../../../../../../src/listeners/substrate-listener/models/block-metadata.event-model";
import { DebioConversionService, OrderStatus, RewardService, SubstrateService, TransactionLoggingService } from "../../../../../../../src/common";
import { OrderCreatedCommand } from "../../../../../../../src/listeners/substrate-listener/commands/orders";
import { Test, TestingModule } from "@nestjs/testing";
import { debioConversionServiceMockFactory, escrowServiceMockFactory, MockType, rewardServiceMockFactory, substrateServiceMockFactory, transactionLoggingServiceMockFactory } from "../../../../../mock";
import { OrderFulfilledHandler } from "../../../../../../../src/listeners/substrate-listener/commands/orders/order-fulfilled/order-fulfilled.handler";
import { EscrowService } from "../../../../../../../src/endpoints/escrow/escrow.service";
import { ethers } from 'ethers';
import { when } from 'jest-when';
import { TransactionLoggingDto } from "../../../../../../../src/common/modules/transaction-logging/dto/transaction-logging.dto";
import { TransactionRequest } from "../../../../../../../src/common/modules/transaction-logging/models/transaction-request.entity";

import * as ordersCommand from "../../../../../../../src/common/polkadot-provider/command/orders";
import * as rewardCommand from "../../../../../../../src/common/polkadot-provider/command/rewards";
import * as userProfileQuery from "../../../../../../../src/common/polkadot-provider/query/user-profile";
import * as serviceRequestQuery from "../../../../../../../src/common/polkadot-provider/query/service-request";

jest.mock('ethers', () => ({
  ethers: {
    utils: {
      toUtf8String: jest.fn(val=>val)
    },
  },
}));

describe("Order Fulfilled Command Event", () => {
  let orderFulfilledHandler: OrderFulfilledHandler;
  let substrateServiceMock: MockType<SubstrateService>;
  let escrowServiceMock: MockType<EscrowService>;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;
  let debioConversionServiceMock: MockType<DebioConversionService>;
  let rewardServiceMock: MockType<RewardService>;

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
    substrateServiceMock = module.get(SubstrateService);
    escrowServiceMock = module.get(EscrowService);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    debioConversionServiceMock = module.get(DebioConversionService);
    rewardServiceMock = module.get(RewardService);

    await module.init();
  });

  it("should defined Order Failed Handler", () => {
    expect(orderFulfilledHandler).toBeDefined();
  });

  it("should not called logging service create", async () => {
    // Arrange
    const refundedOrderSpy = jest.spyOn(ordersCommand, 'refundOrder').mockImplementation();
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
    
    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(ORDER.toHuman().id)
      .mockReturnValue(RESULT_TRANSACTION);

    const orderCancelledCommand: OrderCreatedCommand = new OrderCreatedCommand([ORDER], mockBlockNumber());
    
    const orderLogging: TransactionLoggingDto = {
      address: orderCancelledCommand.orders.customer_id,
      amount: orderCancelledCommand.orders.additional_prices[0].value + orderCancelledCommand.orders.prices[0].value,
      created_at: orderCancelledCommand.orders.updated_at,
      currency: orderCancelledCommand.orders.currency.toUpperCase(),
      parent_id: BigInt(orderCancelledCommand.orders.id),
      ref_number: orderCancelledCommand.orders.id,
      transaction_status: 3,
      transaction_type: 1,
    };

    await orderFulfilledHandler.execute(orderCancelledCommand);
    expect(escrowServiceMock.refundOrder).toHaveBeenCalled();
    expect(escrowServiceMock.refundOrder).toHaveBeenCalledWith(orderCancelledCommand.orders.id);
    expect(toUtf8StringSpy).toHaveBeenCalled();
    expect(refundedOrderSpy).toHaveBeenCalled();
    expect(refundedOrderSpy).toHaveBeenCalledWith(substrateServiceMock.api, substrateServiceMock.pair, orderCancelledCommand.orders.id);
  });
});