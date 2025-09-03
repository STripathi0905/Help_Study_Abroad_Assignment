// Import Jest DOM extensions
import '@testing-library/jest-dom';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    route: '/',
    asPath: '/',
    query: {},
  }),
}));

// Mock for uuid
jest.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));

// Mock for socket.io-client
jest.mock('socket.io-client', () => {
  const mockSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  };
  return jest.fn(() => mockSocket);
});

// Mock for @hello-pangea/dnd
jest.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children }) => children,
  Droppable: ({ children }) => children({
    innerRef: jest.fn(),
    droppableProps: {},
    placeholder: null,
  }, { isDraggingOver: false }),
  Draggable: ({ children }) => children({
    innerRef: jest.fn(),
    draggableProps: {},
    dragHandleProps: {},
  }, { isDragging: false }),
}));

// Suppress console errors during tests
console.error = jest.fn();