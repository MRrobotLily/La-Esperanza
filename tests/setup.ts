// tests/setup.ts
// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

global.localStorage = localStorageMock as any;

// Mock fetch si es necesario
global.fetch = jest.fn();

// Limpiar mocks antes de cada test
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});
