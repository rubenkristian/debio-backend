import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDTO {
  @ApiProperty({
    type: String,
    description: 'visibility',
  })
  visibility: string;
}