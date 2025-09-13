import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
export class RequestPasswordResetDto {
    @IsEmail({}, { message: 'ایمیل معتبر وارد کنید' })
  email: string;
}

export class ResetPasswordDto {
    @IsString({ message: 'کد تایید الزامی است' })
  @MinLength(6, { message: 'کد تایید باید 6 رقم باشد' })
  otpCode: string;
@IsString({ message: 'رمز عبور جدید الزامی است' })
  @MinLength(8, { message: 'رمز عبور باید حداقل 8 کاراکتر باشد' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'رمز عبور باید شامل حروف کوچک، بزرگ، عدد و کاراکتر خاص باشد',
    },
  )
  newPassword: string;
}
