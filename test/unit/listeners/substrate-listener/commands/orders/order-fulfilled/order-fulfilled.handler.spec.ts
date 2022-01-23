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

import * as rewardCommand from "../../../../../../../src/common/polkadot-provider/command/rewards";
import * as userProfileQuery from "../../../../../../../src/common/polkadot-provider/query/user-profile";
import * as serviceRequestQuery from "../../../../../../../src/common/polkadot-provider/query/service-request";
import * as ordersQuery from "../../../../../../../src/common/polkadot-provider/query/orders";
import * as servicesQuery from "../../../../../../../src/common/polkadot-provider/query/services";

jest.mock('ethers', () => ({
  ethers: {
    utils: {
      toUtf8String: jest.fn(val=>val)
    },
  },
}));

describe("Order Fulfilled Handler Event", () => {
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
					id: "1",
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

  it("should defined Order Fulfilled Handler", () => {
    expect(orderFulfilledHandler).toBeDefined();
  });

  it("should not called logging service create", async () => {
    // Arrange
    const queryEthAdressByAccountIdSpy = jest.spyOn(userProfileQuery, 'queryEthAdressByAccountId').mockImplementation();
    const queryOrderDetailByOrderIDSpy = jest.spyOn(ordersQuery, 'queryOrderDetailByOrderID').mockImplementation();
    const queryServiceByIdSpy = jest.spyOn(servicesQuery, 'queryServiceById').mockImplementation();
    const queryServiceInvoiceByOrderIdSpy = jest.spyOn(serviceRequestQuery, 'queryServiceInvoiceByOrderId').mockImplementation();
    const sendRewardsSpy = jest.spyOn(rewardCommand, 'sendRewards').mockImplementation();
    const convertToDbioUnitStringSpy = jest.spyOn(rewardCommand, 'convertToDbioUnitString').mockImplementation();
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
    RESULT_TRANSACTION.transaction_status = 3;
    RESULT_TRANSACTION.transaction_hash = 'string';

    const SERVICE_INVOICE_RETURN = {
      hash_: 'string'
    };

    const SERVICE_RETURN = {
      serviceFlow: 'StakingRequestService'
    };

    const ORDER_DETAIL = {
      orderFlow: 'StakingRequestService'
    };

    const ETH_ADDRESS_ACCOUNT_ID_RETURN = {
      isNone: false,
      unwrap: () => ({
        toString: () => 'string'
      })
    };

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(ORDER.toHuman().id, 3)
      .mockReturnValue(RESULT_STATUS);
    
    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(ORDER.toHuman().id)
      .mockReturnValue(RESULT_TRANSACTION);
    
    when(queryEthAdressByAccountIdSpy)
      .calledWith(
        substrateServiceMock.api, 
        ORDER.toHuman().sellerId
      )
      .mockReturnValue(ETH_ADDRESS_ACCOUNT_ID_RETURN);

    when(queryOrderDetailByOrderIDSpy)
      .calledWith(
        substrateServiceMock.api,
        ORDER.toHuman().id
      )
      .mockReturnValue(ORDER_DETAIL);
    
    when(queryServiceByIdSpy)
      .calledWith(
        substrateServiceMock.api,
        ORDER.toHuman().serviceId
      )
      .mockReturnValue(SERVICE_RETURN);

    when(queryServiceInvoiceByOrderIdSpy)
      .calledWith(
        substrateServiceMock.api,
        ORDER.toHuman().id
      )
      .mockReturnValue(SERVICE_INVOICE_RETURN);
    
    convertToDbioUnitStringSpy.mockReturnValue('1');

    debioConversionServiceMock.getExchange.mockReturnValue({
      dbioToDai: '1'
    });

    const orderCancelledCommand: OrderCreatedCommand = new OrderCreatedCommand([ORDER], mockBlockNumber());

    await orderFulfilledHandler.execute(orderCancelledCommand);
    expect(transactionLoggingServiceMock.getLoggingByHashAndStatus).toHaveBeenCalled();
    expect(toUtf8StringSpy).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.getLoggingByOrderId).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
    expect(queryEthAdressByAccountIdSpy).toHaveBeenCalled();
    expect(queryEthAdressByAccountIdSpy).toHaveBeenCalledWith(substrateServiceMock.api, ORDER.toHuman().sellerId);
    expect(queryOrderDetailByOrderIDSpy).toHaveBeenCalled();
    expect(queryServiceByIdSpy).toHaveBeenCalled();
    expect(queryServiceInvoiceByOrderIdSpy).toHaveBeenCalled();
    expect(debioConversionServiceMock.getExchange).toHaveBeenCalled();
    expect(sendRewardsSpy).toHaveBeenCalled();
    expect(convertToDbioUnitStringSpy).toHaveBeenCalled();
    expect(queryServiceInvoiceByOrderIdSpy).toHaveBeenCalled();
    expect(rewardServiceMock.insert).toHaveBeenCalled();
    expect(sendRewardsSpy).toHaveBeenCalledTimes(2);
    expect(convertToDbioUnitStringSpy).toHaveBeenCalledTimes(2);
    expect(rewardServiceMock.insert).toHaveBeenCalledTimes(2);
    expect(escrowServiceMock.orderFulfilled).toHaveBeenCalled();
    expect(escrowServiceMock.forwardPaymentToSeller).toHaveBeenCalled();
    
    queryEthAdressByAccountIdSpy.mockClear();
    queryOrderDetailByOrderIDSpy.mockClear();
    queryServiceByIdSpy.mockClear();
    queryServiceInvoiceByOrderIdSpy.mockClear();
    sendRewardsSpy.mockClear();
    convertToDbioUnitStringSpy.mockClear();
  });

  it("should called logging service create", async () => {
    // Arrange
    const queryEthAdressByAccountIdSpy = jest.spyOn(userProfileQuery, 'queryEthAdressByAccountId').mockImplementation();
    const queryOrderDetailByOrderIDSpy = jest.spyOn(ordersQuery, 'queryOrderDetailByOrderID').mockImplementation();
    const queryServiceByIdSpy = jest.spyOn(servicesQuery, 'queryServiceById').mockImplementation();
    const queryServiceInvoiceByOrderIdSpy = jest.spyOn(serviceRequestQuery, 'queryServiceInvoiceByOrderId').mockImplementation();
    const sendRewardsSpy = jest.spyOn(rewardCommand, 'sendRewards').mockImplementation();
    const convertToDbioUnitStringSpy = jest.spyOn(rewardCommand, 'convertToDbioUnitString').mockImplementation();
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
    RESULT_TRANSACTION.transaction_status = 3;
    RESULT_TRANSACTION.transaction_hash = 'string';

    const SERVICE_INVOICE_RETURN = {
      hash_: 'string'
    };

    const SERVICE_RETURN = {
      serviceFlow: 'StakingRequestService'
    };

    const ORDER_DETAIL = {
      orderFlow: 'StakingRequestService'
    };

    const ETH_ADDRESS_ACCOUNT_ID_RETURN = {
      isNone: false,
      unwrap: () => ({
        toString: () => 'string'
      })
    };

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(ORDER.toHuman().id, 3)
      .mockReturnValue(RESULT_STATUS);
    
    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(ORDER.toHuman().id)
      .mockReturnValue(RESULT_TRANSACTION);
    
    when(queryEthAdressByAccountIdSpy)
      .calledWith(
        substrateServiceMock.api, 
        ORDER.toHuman().sellerId
      )
      .mockReturnValue(ETH_ADDRESS_ACCOUNT_ID_RETURN);

    when(queryOrderDetailByOrderIDSpy)
      .calledWith(
        substrateServiceMock.api,
        ORDER.toHuman().id
      )
      .mockReturnValue(ORDER_DETAIL);
    
    when(queryServiceByIdSpy)
      .calledWith(
        substrateServiceMock.api,
        ORDER.toHuman().serviceId
      )
      .mockReturnValue(SERVICE_RETURN);

    when(queryServiceInvoiceByOrderIdSpy)
      .calledWith(
        substrateServiceMock.api,
        ORDER.toHuman().id
      )
      .mockReturnValue(SERVICE_INVOICE_RETURN);
    
    convertToDbioUnitStringSpy.mockReturnValue('1');

    debioConversionServiceMock.getExchange.mockReturnValue({
      dbioToDai: '1'
    });

    const orderCancelledCommand: OrderCreatedCommand = new OrderCreatedCommand([ORDER], mockBlockNumber());
    
    const ORDER_LOGGING_CALLED_WITH: TransactionLoggingDto = {
      address: orderCancelledCommand.orders.customer_id,
      amount: (Number(orderCancelledCommand.orders.additional_prices[0].value) / 10 ** 18) + (Number(orderCancelledCommand.orders.prices[0].value) / 10 ** 18),
      created_at: orderCancelledCommand.orders.updated_at,
      currency: orderCancelledCommand.orders.currency.toUpperCase(),
      parent_id: BigInt(RESULT_TRANSACTION.id),
      ref_number: orderCancelledCommand.orders.id,
      transaction_status: 3,
      transaction_type: 1,
    };

    await orderFulfilledHandler.execute(orderCancelledCommand);
    expect(transactionLoggingServiceMock.getLoggingByHashAndStatus).toHaveBeenCalled();
    expect(toUtf8StringSpy).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.getLoggingByOrderId).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalledWith(ORDER_LOGGING_CALLED_WITH);
    expect(queryEthAdressByAccountIdSpy).toHaveBeenCalled();
    expect(queryEthAdressByAccountIdSpy).toHaveBeenCalledWith(substrateServiceMock.api, ORDER.toHuman().sellerId);
    expect(queryOrderDetailByOrderIDSpy).toHaveBeenCalled();
    expect(queryServiceByIdSpy).toHaveBeenCalled();
    expect(queryServiceInvoiceByOrderIdSpy).toHaveBeenCalled();
    expect(debioConversionServiceMock.getExchange).toHaveBeenCalled();
    expect(sendRewardsSpy).toHaveBeenCalled();
    expect(convertToDbioUnitStringSpy).toHaveBeenCalled();
    expect(queryServiceInvoiceByOrderIdSpy).toHaveBeenCalled();
    expect(rewardServiceMock.insert).toHaveBeenCalled();
    expect(sendRewardsSpy).toHaveBeenCalledTimes(2);
    expect(convertToDbioUnitStringSpy).toHaveBeenCalledTimes(2);
    expect(rewardServiceMock.insert).toHaveBeenCalledTimes(2);
    expect(escrowServiceMock.orderFulfilled).toHaveBeenCalled();
    expect(escrowServiceMock.forwardPaymentToSeller).toHaveBeenCalled();
    
    queryEthAdressByAccountIdSpy.mockClear();
    queryOrderDetailByOrderIDSpy.mockClear();
    queryServiceByIdSpy.mockClear();
    queryServiceInvoiceByOrderIdSpy.mockClear();
    sendRewardsSpy.mockClear();
    convertToDbioUnitStringSpy.mockClear();
  });
  
  it("when eth address isNone true", async () => {
    // Arrange
    const queryEthAdressByAccountIdSpy = jest.spyOn(userProfileQuery, 'queryEthAdressByAccountId').mockImplementation();
    const queryOrderDetailByOrderIDSpy = jest.spyOn(ordersQuery, 'queryOrderDetailByOrderID').mockImplementation();
    const queryServiceByIdSpy = jest.spyOn(servicesQuery, 'queryServiceById').mockImplementation();
    const queryServiceInvoiceByOrderIdSpy = jest.spyOn(serviceRequestQuery, 'queryServiceInvoiceByOrderId').mockImplementation();
    const sendRewardsSpy = jest.spyOn(rewardCommand, 'sendRewards').mockImplementation();
    const convertToDbioUnitStringSpy = jest.spyOn(rewardCommand, 'convertToDbioUnitString').mockImplementation();
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
    RESULT_TRANSACTION.transaction_status = 3;
    RESULT_TRANSACTION.transaction_hash = 'string';

    const SERVICE_INVOICE_RETURN = {
      hash_: 'string'
    };

    const SERVICE_RETURN = {
      serviceFlow: 'StakingRequestService'
    };

    const ORDER_DETAIL = {
      orderFlow: 'StakingRequestService'
    };

    const ETH_ADDRESS_ACCOUNT_ID_RETURN = {
      isNone: true,
      unwrap: () => ({
        toString: () => 'string'
      })
    };

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(ORDER.toHuman().id, 3)
      .mockReturnValue(RESULT_STATUS);
    
    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(ORDER.toHuman().id)
      .mockReturnValue(RESULT_TRANSACTION);
    
    when(queryEthAdressByAccountIdSpy)
      .calledWith(
        substrateServiceMock.api, 
        ORDER.toHuman().sellerId
      )
      .mockReturnValue(ETH_ADDRESS_ACCOUNT_ID_RETURN);

    when(queryOrderDetailByOrderIDSpy)
      .calledWith(
        substrateServiceMock.api,
        ORDER.toHuman().id
      )
      .mockReturnValue(ORDER_DETAIL);
    
    when(queryServiceByIdSpy)
      .calledWith(
        substrateServiceMock.api,
        ORDER.toHuman().serviceId
      )
      .mockReturnValue(SERVICE_RETURN);

    when(queryServiceInvoiceByOrderIdSpy)
      .calledWith(
        substrateServiceMock.api,
        ORDER.toHuman().id
      )
      .mockReturnValue(SERVICE_INVOICE_RETURN);
    
    convertToDbioUnitStringSpy.mockReturnValue('1');

    debioConversionServiceMock.getExchange.mockReturnValue({
      dbioToDai: '1'
    });

    const orderCancelledCommand: OrderCreatedCommand = new OrderCreatedCommand([ORDER], mockBlockNumber());
    
    const ORDER_LOGGING_CALLED_WITH: TransactionLoggingDto = {
      address: orderCancelledCommand.orders.customer_id,
      amount: (Number(orderCancelledCommand.orders.additional_prices[0].value) / 10 ** 18) + (Number(orderCancelledCommand.orders.prices[0].value) / 10 ** 18),
      created_at: orderCancelledCommand.orders.updated_at,
      currency: orderCancelledCommand.orders.currency.toUpperCase(),
      parent_id: BigInt(RESULT_TRANSACTION.id),
      ref_number: orderCancelledCommand.orders.id,
      transaction_status: 3,
      transaction_type: 1,
    };

    await orderFulfilledHandler.execute(orderCancelledCommand);
    expect(transactionLoggingServiceMock.getLoggingByHashAndStatus).toHaveBeenCalled();
    expect(toUtf8StringSpy).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.getLoggingByOrderId).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalledWith(ORDER_LOGGING_CALLED_WITH);
    expect(queryEthAdressByAccountIdSpy).toHaveBeenCalled();
    expect(queryEthAdressByAccountIdSpy).toHaveBeenCalledWith(substrateServiceMock.api, ORDER.toHuman().sellerId);
    expect(queryOrderDetailByOrderIDSpy).not.toHaveBeenCalled();
    expect(queryServiceByIdSpy).not.toHaveBeenCalled();
    expect(queryServiceInvoiceByOrderIdSpy).not.toHaveBeenCalled();
    expect(debioConversionServiceMock.getExchange).not.toHaveBeenCalled();
    expect(sendRewardsSpy).not.toHaveBeenCalled();
    expect(convertToDbioUnitStringSpy).not.toHaveBeenCalled();
    expect(queryServiceInvoiceByOrderIdSpy).not.toHaveBeenCalled();
    expect(rewardServiceMock.insert).not.toHaveBeenCalled();
    expect(sendRewardsSpy).not.toHaveBeenCalledTimes(2);
    expect(convertToDbioUnitStringSpy).not.toHaveBeenCalledTimes(2);
    expect(rewardServiceMock.insert).not.toHaveBeenCalledTimes(2);
    expect(escrowServiceMock.orderFulfilled).not.toHaveBeenCalled();
    expect(escrowServiceMock.forwardPaymentToSeller).not.toHaveBeenCalled();
    
    queryEthAdressByAccountIdSpy.mockClear();
    queryOrderDetailByOrderIDSpy.mockClear();
    queryServiceByIdSpy.mockClear();
    queryServiceInvoiceByOrderIdSpy.mockClear();
    sendRewardsSpy.mockClear();
    convertToDbioUnitStringSpy.mockClear();
  });
  
  it("when order and service flow is not StakingRequestService", async () => {
    // Arrange
    const queryEthAdressByAccountIdSpy = jest.spyOn(userProfileQuery, 'queryEthAdressByAccountId').mockImplementation();
    const queryOrderDetailByOrderIDSpy = jest.spyOn(ordersQuery, 'queryOrderDetailByOrderID').mockImplementation();
    const queryServiceByIdSpy = jest.spyOn(servicesQuery, 'queryServiceById').mockImplementation();
    const queryServiceInvoiceByOrderIdSpy = jest.spyOn(serviceRequestQuery, 'queryServiceInvoiceByOrderId').mockImplementation();
    const sendRewardsSpy = jest.spyOn(rewardCommand, 'sendRewards').mockImplementation();
    const convertToDbioUnitStringSpy = jest.spyOn(rewardCommand, 'convertToDbioUnitString').mockImplementation();
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
    RESULT_TRANSACTION.transaction_status = 3;
    RESULT_TRANSACTION.transaction_hash = 'string';

    const SERVICE_INVOICE_RETURN = {
      hash_: 'string'
    };

    const SERVICE_RETURN = {
      serviceFlow: ''
    };

    const ORDER_DETAIL = {
      orderFlow: ''
    };

    const ETH_ADDRESS_ACCOUNT_ID_RETURN = {
      isNone: false,
      unwrap: () => ({
        toString: () => 'string'
      })
    };

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(ORDER.toHuman().id, 3)
      .mockReturnValue(RESULT_STATUS);
    
    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(ORDER.toHuman().id)
      .mockReturnValue(RESULT_TRANSACTION);
    
    when(queryEthAdressByAccountIdSpy)
      .calledWith(
        substrateServiceMock.api, 
        ORDER.toHuman().sellerId
      )
      .mockReturnValue(ETH_ADDRESS_ACCOUNT_ID_RETURN);

    when(queryOrderDetailByOrderIDSpy)
      .calledWith(
        substrateServiceMock.api,
        ORDER.toHuman().id
      )
      .mockReturnValue(ORDER_DETAIL);
    
    when(queryServiceByIdSpy)
      .calledWith(
        substrateServiceMock.api,
        ORDER.toHuman().serviceId
      )
      .mockReturnValue(SERVICE_RETURN);

    when(queryServiceInvoiceByOrderIdSpy)
      .calledWith(
        substrateServiceMock.api,
        ORDER.toHuman().id
      )
      .mockReturnValue(SERVICE_INVOICE_RETURN);
    
    convertToDbioUnitStringSpy.mockReturnValue('1');

    debioConversionServiceMock.getExchange.mockReturnValue({
      dbioToDai: '1'
    });

    const orderCancelledCommand: OrderCreatedCommand = new OrderCreatedCommand([ORDER], mockBlockNumber());
    
    const ORDER_LOGGING_CALLED_WITH: TransactionLoggingDto = {
      address: orderCancelledCommand.orders.customer_id,
      amount: (Number(orderCancelledCommand.orders.additional_prices[0].value) / 10 ** 18) + (Number(orderCancelledCommand.orders.prices[0].value) / 10 ** 18),
      created_at: orderCancelledCommand.orders.updated_at,
      currency: orderCancelledCommand.orders.currency.toUpperCase(),
      parent_id: BigInt(RESULT_TRANSACTION.id),
      ref_number: orderCancelledCommand.orders.id,
      transaction_status: 3,
      transaction_type: 1,
    };

    await orderFulfilledHandler.execute(orderCancelledCommand);
    expect(transactionLoggingServiceMock.getLoggingByHashAndStatus).toHaveBeenCalled();
    expect(toUtf8StringSpy).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.getLoggingByOrderId).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
    expect(queryEthAdressByAccountIdSpy).toHaveBeenCalled();
    expect(queryEthAdressByAccountIdSpy).toHaveBeenCalledWith(substrateServiceMock.api, ORDER.toHuman().sellerId);
    expect(queryOrderDetailByOrderIDSpy).toHaveBeenCalled();
    expect(queryServiceByIdSpy).toHaveBeenCalled();
    expect(queryServiceInvoiceByOrderIdSpy).not.toHaveBeenCalled();
    expect(debioConversionServiceMock.getExchange).not.toHaveBeenCalled();
    expect(sendRewardsSpy).not.toHaveBeenCalled();
    expect(convertToDbioUnitStringSpy).not.toHaveBeenCalled();
    expect(queryServiceInvoiceByOrderIdSpy).not.toHaveBeenCalled();
    expect(rewardServiceMock.insert).not.toHaveBeenCalled();
    expect(sendRewardsSpy).not.toHaveBeenCalledTimes(2);
    expect(convertToDbioUnitStringSpy).not.toHaveBeenCalledTimes(2);
    expect(rewardServiceMock.insert).not.toHaveBeenCalledTimes(2);
    expect(escrowServiceMock.orderFulfilled).toHaveBeenCalled();
    expect(escrowServiceMock.forwardPaymentToSeller).toHaveBeenCalled();
    
    queryEthAdressByAccountIdSpy.mockClear();
    queryOrderDetailByOrderIDSpy.mockClear();
    queryServiceByIdSpy.mockClear();
    queryServiceInvoiceByOrderIdSpy.mockClear();
    sendRewardsSpy.mockClear();
    convertToDbioUnitStringSpy.mockClear();
  });
});
