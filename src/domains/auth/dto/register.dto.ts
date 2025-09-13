import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional, IsPhoneNumber } from 'class-validator';
export class RegisterDto {
    @IsEmail({}, { message: 'ایمیل معتبر وارد کنید' })
  email: string;
@IsString({ message: 'نام الزامی است' })
  @MinLength(2, { message: 'نام باید حداقل 2 کاراکتر باشد' })
  @MaxLength(50, { message: 'نام نمی‌تواند بیش از 50 کاراکتر باشد' })
  firstName: string;
@IsString({ message: 'نام خانوادگی الزامی است' })
  @MinLength(2, { message: 'نام خانوادگی باید حداقل 2 کاراکتر باشد' })
  @MaxLength(50, { message: 'نام خانوادگی نمی‌تواند بیش از 50 کاراکتر باشد' })
  lastName: string;
@IsString({ message: 'رمز عبور الزامی است' })
  @MinLength(8, { message: 'رمز عبور باید حداقل 8 کاراکتر باشد' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'رمز عبور باید شامل حروف کوچک، بزرگ، عدد و کاراکتر خاص باشد',
    },
  )
  password: string;
@IsOptional()
  @IsPhoneNumber(null, { message: 'شماره تلفن معتبر وارد کنید' })
  phone?: string;
}
