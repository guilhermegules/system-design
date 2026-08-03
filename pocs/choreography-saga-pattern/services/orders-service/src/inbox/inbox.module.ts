import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InboxEvent } from './inbox.entity';
import { InboxService } from './inbox.service';

@Module({
  imports: [TypeOrmModule.forFeature([InboxEvent])],
  providers: [InboxService],
  exports: [InboxService],
})
export class InboxModule {}
