import { Controller, Get, Param, Put, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SentryInterceptor } from '../../common';
import { notificationData } from '../../common/modules/notification/models/response';
import { NotificationService } from '../../common/modules/notification/notification.service';

@UseInterceptors(SentryInterceptor)
@Controller('notification')
export class NotificationEndpointController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get(':to_id')
  @ApiParam({ name: 'to_id' })
  @ApiOperation({ description: 'get all notification by receiver.' })
  @ApiResponse({
    status: 200,
    schema: {
      example: notificationData,
    },
  })
  async getAllNotificationByToId(@Param('to_id') to_id: string) {
    try {
      return {
        data: await this.notificationService.getAllByToId(to_id),
      };
    } catch (error) {
      return error;
    }
  }

  @Put('set-read/:notification_id')
  @ApiParam({ name: 'notification_id' })
  @ApiOperation({ description: 'update data notification to has been read.' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        data: {
          generatedMaps: [],
          raw: [],
          affected: 1,
        },
      },
    },
  })
  async setNotificationHasbeenReadById(
    @Param('notification_id') notification_id: string,
  ) {
    try {
      return {
        data: await this.notificationService.setNotificationHasBeenReadById(
          notification_id,
        ),
      };
    } catch (error) {
      return error;
    }
  }

  @Put('set-bulk-read/:to_id')
  @ApiParam({ name: 'to_id' })
  @ApiOperation({ description: 'set all notification receiver has beed read' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        data: {
          generatedMaps: [],
          raw: [],
          affected: 9,
        },
      },
    },
  })
  async setBulkNotificationHasbeenRead(@Param('to_id') to_id: string) {
    try {
      return {
        data: await this.notificationService.setBulkNotificationHasBeenRead(
          to_id,
        ),
      };
    } catch (error) {
      return error;
    }
  }
}
