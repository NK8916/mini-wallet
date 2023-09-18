import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { WalletService } from './wallet.service';

@Injectable()
export class TransactionGuard implements CanActivate {
  constructor(private walletService: WalletService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log('user=>', request.user);
    const isWalletEnabled = await this.walletService.isWalletEnabled(
      request.user.id,
    );
    if (!isWalletEnabled) {
      throw new BadRequestException('Wallet is not enabled');
    }
    return true;
  }
}
