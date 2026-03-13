import '@testing-library/jest-dom';

// Add TextEncoder/TextDecoder for React Router
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Add fetch API for Firebase (mock)
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      ok: true,
      status: 200,
      headers: new Map(),
    })
  );
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {};
}

if (typeof global.Request === 'undefined') {
  global.Request = class Request {};
}

if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {};
}

// Mock window.matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

// Mock ResizeObserver
window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
