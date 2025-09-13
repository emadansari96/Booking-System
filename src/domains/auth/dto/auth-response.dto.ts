export class AuthResponseDto {
    accessToken: string;

    tokenType: string;

    expiresIn: number;

    user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
  };
}

export class RegisterResponseDto {
    message: string;

    user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
  };
}
