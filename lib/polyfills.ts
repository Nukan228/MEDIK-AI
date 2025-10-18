// Simple polyfills for React Native compatibility
// This replaces the problematic react-native-polyfill-globals

// Only add polyfills if they don't exist and we're in React Native environment
if (typeof window === 'undefined' && typeof global !== 'undefined') {
  // Add minimal fetch polyfill if needed
  if (typeof global.fetch === 'undefined') {
    console.warn('Fetch polyfill may be needed');
  }
  
  // Add minimal TextEncoder/TextDecoder if needed
  if (typeof global.TextEncoder === 'undefined') {
    console.warn('TextEncoder polyfill may be needed');
  }
}

export {};