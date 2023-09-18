import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { Account } from '../wallet/entities/account.entity';
import { Transactions } from '../wallet/entities/transaction.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Account]),
    TypeOrmModule.forFeature([Transactions]),
  ],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
