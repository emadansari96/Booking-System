import 'reflect-metadata';

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    hGet: jest.fn(),
    hSet: jest.fn(),
    hDel: jest.fn(),
    lPush: jest.fn(),
    rPop: jest.fn(),
    sAdd: jest.fn(),
    sRem: jest.fn(),
    sMembers: jest.fn(),
    zAdd: jest.fn(),
    zRem: jest.fn(),
    zRange: jest.fn(),
    publish: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    pipeline: jest.fn(() => ({
      exec: jest.fn(),
    })),
    multi: jest.fn(() => ({
      exec: jest.fn(),
    })),
    ping: jest.fn(),
    quit: jest.fn(),
  }));
});

// Mock TypeORM
jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  getRepository: jest.fn(),
  getConnection: jest.fn(),
  createConnection: jest.fn(),
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
  genSalt: jest.fn(),
}));

// Mock crypto
jest.mock('crypto', () => ({
  createHmac: jest.fn(),
  randomUUID: jest.fn(),
}));

// Global test timeout
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global error handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
