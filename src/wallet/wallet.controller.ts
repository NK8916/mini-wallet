import {
  Controller,
  Post,
  Body,
  Get,
  HttpException,
  HttpStatus,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { IntitializeAccountDto } from './dto/intitialize-account.dto';
import { TransactionDto } from './dto/transaction.dto';
import { DisableAccountDto } from './dto/disable-account.dto';
import { AuthGuard } from '../auth/auth.guard';
import { TransactionGuard } from './transaction.guard';

@Controller('api/v1')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('init')
  intitializeAccount(@Body() intitializeAccountDto: IntitializeAccountDto) {
    try {
      return this.walletService.intitializeAccountService(
        intitializeAccountDto,
      );
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Post('wallet')
  enableWallet(@Request() req) {
    try {
      return this.walletService.enableWallet(req.user.id);
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('wallet')
  getAmountData(@Request() req) {
    try {
      return this.walletService.findAmountData(req.user.id);
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('transactions')
  getAlltrasactions() {
    try {
      return this.walletService.getAllTransactions();
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(TransactionGuard)
  @UseGuards(AuthGuard)
  @Post('wallet/deposits')
  deposit(@Request() req, @Body() depositDto: TransactionDto) {
    try {
      return this.walletService.depositAmount(depositDto, req.user.id);
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(TransactionGuard)
  @UseGuards(AuthGuard)
  @Post('wallet/withdrawals')
  withdrawls(@Request() req, @Body() withdrawDto: TransactionDto) {
    try {
      return this.walletService.withdrawls(withdrawDto, req.user.id);
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Patch('wallet')
  disableWallet(@Request() req, @Body() disableAccountDto: DisableAccountDto) {
    try {
      return this.walletService.disableWallet(disableAccountDto, req.user.id);
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
