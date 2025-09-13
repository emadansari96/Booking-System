import { Test, TestingModule } from '@nestjs/testing';
import { UserCqrsController } from './user-cqrs.controller';
import { CommandBus } from '../cqrs/user-command-bus';
import { QueryBus } from '../cqrs/user-query-bus';
import { CreateUserCommand } from '../commands/create-user.command';
import { GetUserByIdQuery } from '../queries/get-user-by-id.query';
import { UserRole } from '../dtos/user-role.dto';

describe('UserCqrsController', () => {
  let controller: UserCqrsController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  const mockCommandBus = {
    execute: jest.fn(),
  };

  const mockQueryBus = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserCqrsController],
      providers: [
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        },
        {
          provide: QueryBus,
          useValue: mockQueryBus,
        },
      ],
    }).compile();

    controller = module.get<UserCqrsController>(UserCqrsController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const createUserDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        role: UserRole.CUSTOMER,
        avatarUrl: 'https://example.com/avatar.jpg'
      };

      const mockUser = {
        id: { value: '123e4567-e89b-12d3-a456-426614174000' },
        email: { value: 'test@example.com' },
        name: { firstName: 'John', lastName: 'Doe' },
        phone: { value: '+1234567890' },
        role: { value: UserRole.CUSTOMER },
        isActive: true,
        avatarUrl: 'https://example.com/avatar.jpg',
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCommandBus.execute.mockResolvedValue(mockUser);

      const result = await controller.createUser(createUserDto);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        expect.any(CreateUserCommand)
      );
      expect(result).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        role: UserRole.CUSTOMER,
        isActive: true,
        avatarUrl: 'https://example.com/avatar.jpg',
        lastLoginAt: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser = {
        id: { value: userId },
        email: { value: 'test@example.com' },
        name: { firstName: 'John', lastName: 'Doe' },
        phone: { value: '+1234567890' },
        role: { value: UserRole.CUSTOMER },
        isActive: true,
        avatarUrl: null,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockQueryBus.execute.mockResolvedValue(mockUser);

      const result = await controller.getUserById(userId);

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.any(GetUserByIdQuery)
      );
      expect(result).toEqual({
        id: userId,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        role: UserRole.CUSTOMER,
        isActive: true,
        avatarUrl: null,
        lastLoginAt: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });
  });
});
