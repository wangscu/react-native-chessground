import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['__tests__/**/*.test.{ts,tsx}'],
    root: '.',
    alias: {
      'react-native': path.resolve(__dirname, '__tests__/__mocks__/react-native.ts'),
      'react-native-reanimated': path.resolve(__dirname, '__tests__/__mocks__/react-native-reanimated.ts'),
      'react-native-gesture-handler': path.resolve(__dirname, '__tests__/__mocks__/react-native-gesture-handler.ts'),
      'react-native-svg': path.resolve(__dirname, '__tests__/__mocks__/react-native-svg.ts'),
    },
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      thresholds: {},
    },
  },
});
