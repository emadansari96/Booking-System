import { IsEmail, IsString, MinLength } from 'class-validator';
export class LoginDto {
    @IsEmail({}, { message: 'ایمیل معتبر وارد کنید' })
  email: string;
@IsString({ message: 'رمز عبور الزامی است' })
  @MinLength(1, { message: 'رمز عبور نمی‌تواند خالی باشد' })
  password: string;
}
