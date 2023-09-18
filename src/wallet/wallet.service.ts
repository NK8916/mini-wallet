import { Injectable, BadRequestException } from '@nestjs/common';
import { IntitializeAccountDto } from './dto/intitialize-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Account } from '../wallet/entities/account.entity';
import { Transactions } from '../wallet/entities/transaction.entity';
import { TransactionDto } from './dto/transaction.dto';
import { DisableAccountDto } from './dto/disable-account.dto';
import { TransactionType } from './constants';
import { Http2ServerResponse } from 'http2';

@Injectable()
export class WalletService {
  constructor(
    private authService: AuthService,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Transactions)
    private readonly transactionRepository: Repository<Transactions>,
  ) {}

  async intitializeAccountService(
    intitializeAccountDto: IntitializeAccountDto,
  ) {
    try {
      const customer_xid = intitializeAccountDto.customer_xid;
      const where = { owned_by: customer_xid };
      const existingCustomer = await this.findExistingCustomer(where);
      if (existingCustomer && existingCustomer.length) {
        throw new BadRequestException('Customer Id already exist');
      }
      const accountData = {
        owned_by: customer_xid,
        enabled_at: Date.now(),
      };
      const account = await this.accountRepository.save(accountData);
      const { access_token } = await this.authService.register(account.id);
      await this.accountRepository.save({
        id: account.id,
        token: access_token,
      });
      return { token: access_token };
    } catch (e) {
      console.error('Failed to initiate account', e);
      throw e;
    }
  }

  async enableWallet(id: number) {
    try {
      const where = { id: id, is_active: true };
      const active_customer = await this.findExistingCustomer(where);
      console.log('active_customer=>', active_customer);
      if (active_customer.length) {
        throw new BadRequestException('Customer wallet already enabled');
      }
      await this.accountRepository.save({
        id: id,
        is_active: true,
      });
    } catch (e) {
      console.error('Failed to enable wallet', e);
      throw e;
    }
  }

  async findExistingCustomer(where: object): Promise<Account[]> {
    let result: any = [];
    try {
      result = await this.accountRepository.find({
        where: where,
      });
    } catch (e) {
      console.error('Error while fetching data', e);
    }
    return result;
  }

  async findAmountData(id: number): Promise<Account[]> {
    let result: any = [];
    try {
      result = await this.accountRepository.find({
        select: ['owned_by', 'balance', 'enabledAt'],
        where: { id: id },
      });
    } catch (e) {
      console.error('Failed to fetch amount', e);
      throw e;
    }
    return result;
  }

  async getAllTransactions(): Promise<Transactions[]> {
    let result: any = [];
    try {
      result = await this.transactionRepository.find({
        select: ['amount', 'type', 'reference_id', 'createdAt'],
      });
    } catch (e) {
      console.error('Failed to fetch transactions', e);
      throw e;
    }
    return result;
  }

  async isWalletEnabled(id: number): Promise<boolean> {
    let result: any = [];
    try {
      result = await this.accountRepository.find({
        where: { id: id, is_active: true },
      });
      return true ? result.length : false;
    } catch (e) {
      console.error('Failed to enable wallet', e);
      throw e;
    }
  }

  async depositAmount(dispositData: TransactionDto, id: number) {
    try {
      const amount = dispositData.amount;
      const referenceId = dispositData.reference_id;
      const isDuplicateTransaction = await this.checkForDuplicateTransaction(
        referenceId,
      );
      if (isDuplicateTransaction) {
        throw new BadRequestException(
          'Transaction Reference Id Already exists',
        );
      }
      const transactionData = {
        amount: amount,
        type: TransactionType.DEPOSIT,
        reference_id: referenceId,
      };
      const account = await this.accountRepository.findOne({
        where: { id: id },
      });
      console.log('account=>', account);
      await this.accountRepository.update(id, {
        balance: account.balance + amount,
      });
      await this.transactionRepository.save(transactionData);
    } catch (e) {
      console.error('failed to deposit amount', e);
      throw e;
    }
  }

  async withdrawls(withdrawData: TransactionDto, id: number) {
    try {
      const amount = withdrawData.amount;
      const referenceId = withdrawData.reference_id;
      const isDuplicateTransaction = await this.checkForDuplicateTransaction(
        referenceId,
      );
      if (isDuplicateTransaction) {
        throw new BadRequestException(
          'Transaction Reference Id Already exists',
        );
      }
      const transactionData = {
        amount: amount,
        type: TransactionType.WITHDRAW,
        reference_id: referenceId,
      };
      const account = await this.accountRepository.findOne({
        where: { id: id, balance: MoreThanOrEqual(amount) },
      });
      if (!account) {
        throw new BadRequestException('Balance is not enough');
      }
      await this.accountRepository.update(id, {
        balance: account.balance - amount,
      });
      await this.transactionRepository.save(transactionData);
    } catch (e) {
      console.error('failed to withdraw amount', e);
      throw e;
    }
  }

  async disableWallet(disableAccountDto: DisableAccountDto, id: number) {
    try {
      await this.accountRepository.update(id, {
        is_active: !disableAccountDto.is_disabled,
      });
    } catch (e) {
      console.error('failed to disable wallet', e);
      throw e;
    }
  }

  async checkForDuplicateTransaction(reference_id: string) {
    try {
      const result = await this.transactionRepository.find({
        where: { reference_id: reference_id },
      });
      return true ? result && result.length : false;
    } catch (e) {
      console.error('Failed to check duplicate transaction');
      throw e;
    }
  }
}
