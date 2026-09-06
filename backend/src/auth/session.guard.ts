import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class SessionGuard
  implements CanActivate
{
  canActivate(
    context: ExecutionContext,
  ) {
    const request =
      context
        .switchToHttp()
        .getRequest();

    if (!request.session?.user) {
      throw new UnauthorizedException(
        'Please login first',
      );
    }

    return true;
  }
}
