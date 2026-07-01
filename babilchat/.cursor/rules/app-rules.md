# Babil Chat - Development Rules & Guidelines

## 🎯 Project Overview
Babil Chat is a spiritual guidance app designed for iOS, featuring AI-powered chat, daily devotionals, prayer wall, and community features with Islamic focus.

## 📱 Platform & Technology Standards

### **React Native & Expo Rules**
- Always use TypeScript for type safety
- Follow Expo's managed workflow
- Use functional components with hooks only
- Implement proper error boundaries
- Always use SafeAreaProvider and SafeAreaView
- Prefer Expo's built-in components over third-party alternatives

### **iOS Design Compliance**
- Follow iOS Human Interface Guidelines
- Use iOS native patterns and behaviors
- Implement proper haptic feedback
- Support iOS accessibility features
- Ensure compatibility with iOS 16.0+
- Support iPhone and iPad layouts

## 🎨 Design System Rules

### **Color Scheme - Dark/Gray Gradients**
```typescript
// Primary gradients (always use these)
const gradients = {
  background: ['#0f0f23', '#1a1a2e', '#16213e'],
  card: ['#1a1a1a', '#2d2d2d', '#404040'],
  accent: ['#7c3aed', '#8b5cf6', '#a78bfa'],
  success: ['#059669', '#10b981', '#34d399'],
  warning: ['#d97706', '#f59e0b', '#fbbf24'],
}
```

### **Typography Standards**
- Primary font: SF Pro Display (iOS native)
- Arabic font: Geeza Pro
- Use scale: 12, 14, 16, 18, 20, 24, 32px
- Always support RTL for Arabic text
- Minimum touch target: 44x44 points

### **Card Design Rules**
```typescript
// Standard card styling
const cardStyles = {
  borderRadius: 16,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8, // Android
  marginHorizontal: 16,
  marginVertical: 8,
  padding: 20,
}
```

### **Animation Standards**
- Use react-native-reanimated 3 for all animations
- Standard duration: 300ms for page transitions
- Use easing curves: ease-in-out for standard animations
- Implement gesture-driven animations with react-native-gesture-handler
- Always respect user's reduce motion preference

## 📐 Layout & Responsive Design

### **Responsive Breakpoints**
```typescript
const breakpoints = {
  small: 375,    // iPhone SE
  medium: 390,   // iPhone 14/15
  large: 430,    // iPhone 14/15 Pro Max
  tablet: 768,   // iPad
}
```

### **Safe Area Management**
- Always wrap screens with SafeAreaView
- Use SafeAreaScrollView for scrollable content
- Never hardcode top/bottom padding
- Use useSafeAreaInsets() hook when needed

### **Layout Patterns**
- Use Flexbox for all layouts
- Implement consistent spacing scale: 4, 8, 12, 16, 20, 24, 32px
- Use percentage widths for responsive design
- Implement proper keyboard avoidance

## 🚀 Performance Rules

### **React Native Optimization**
- Use FlatList/SectionList for long lists (>10 items)
- Implement lazy loading for images
- Use useCallback and useMemo appropriately
- Avoid unnecessary re-renders with React.memo
- Use getItemLayout when possible for FlatList

### **Image Optimization**
- Use WebP format when supported
- Implement progressive loading
- Use expo-image for advanced features
- Always provide width/height dimensions
- Compress images to <100KB when possible

### **Bundle Size**
- Use dynamic imports for non-critical code
- Implement code splitting for large features
- Remove unused dependencies regularly
- Use hermes engine optimizations

## 🔧 Code Quality Standards

### **TypeScript Rules**
- Use strict mode configuration
- Define interfaces for all props and state
- Avoid `any` type - use `unknown` instead
- Use proper generic typing
- Export types and interfaces separately

### **Component Structure**
```typescript
// Standard component structure
interface ComponentProps {
  // Props definition
}

export function ComponentName({ props }: ComponentProps) {
  // 1. Hooks
  // 2. State
  // 3. Effects
  // 4. Event handlers
  // 5. Render methods
  // 6. Return JSX
}
```

### **Naming Conventions**
- Components: PascalCase (e.g., `HomeScreen`, `PrayerCard`)
- Files: kebab-case (e.g., `home-screen.tsx`, `prayer-card.tsx`)
- Functions: camelCase (e.g., `handlePrayerSubmit`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- Folders: kebab-case (e.g., `prayer-wall`, `ai-chat`)

## 🗂️ File & Folder Organization

### **Project Structure**
```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── forms/        # Form components
│   └── cards/        # Card components
├── screens/
│   ├── home/
│   ├── chat/
│   ├── prayer-wall/
│   └── settings/
├── navigation/
├── services/         # API services
├── hooks/           # Custom hooks
├── utils/           # Utility functions
├── constants/       # App constants
├── types/           # TypeScript types
└── assets/
```

### **Import Organization**
```typescript
// 1. React/React Native imports
import React from 'react';
import { View, Text } from 'react-native';

// 2. Third-party libraries
import { useNavigation } from '@react-navigation/native';

// 3. Internal imports (absolute paths)
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks';

// 4. Relative imports
import './styles.css';
```

## 🧪 Testing Requirements

### **Test Coverage Standards**
- Minimum 80% code coverage
- 100% coverage for utility functions
- All components must have tests
- Critical user flows must have E2E tests

### **Testing Stack**
```bash
# Unit tests
npm run test              # Jest + React Native Testing Library
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report

# E2E tests
npm run test:e2e          # Detox/Maestro tests
```

### **Test File Organization**
- Place tests next to source files: `component.test.tsx`
- Use descriptive test names
- Group related tests with `describe` blocks
- Mock external dependencies

## 🔒 Security & Privacy

### **Data Protection**
- Use react-native-keychain for sensitive data
- Implement proper input validation
- Never log sensitive information
- Use HTTPS for all API calls
- Implement proper authentication flows

### **API Security**
- Use environment variables for API keys
- Implement request signing
- Use proper error handling without exposing internals
- Implement rate limiting awareness

## 🌍 Internationalization

### **Multi-language Support**
- Support Turkish (primary), English, Arabic
- Use react-native-i18n or expo-localization
- Implement RTL support for Arabic
- Store translations in structured JSON files
- Use translation keys, not hardcoded strings

### **Cultural Considerations**
- Respect Islamic prayer times and dates
- Use appropriate Islamic terminology
- Support Hijri calendar alongside Gregorian
- Implement proper Arabic text rendering

## 📱 Navigation Rules

### **React Navigation Standards**
- Use typed navigation with TypeScript
- Implement proper deep linking
- Use stack navigators for hierarchical flows
- Use tab navigators for main sections
- Implement proper back button handling

### **Screen Transitions**
```typescript
// Standard screen options
const screenOptions = {
  headerShown: false,
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
  transitionSpec: {
    open: TransitionSpecs.TransitionIOSSpec,
    close: TransitionSpecs.TransitionIOSSpec,
  },
}
```

## 💡 State Management

### **Context + Reducer Pattern**
- Use React Context for global state
- Implement useReducer for complex state logic
- Use React Query for server state
- Implement proper error states
- Use AsyncStorage for persistence

### **State Structure**
```typescript
interface AppState {
  user: UserState | null;
  prayers: PrayerState;
  chat: ChatState;
  settings: SettingsState;
}
```

## 🚨 Error Handling

### **Error Boundaries**
- Implement global error boundary
- Use specific error boundaries for critical sections
- Provide fallback UI for errors
- Log errors to crash reporting service

### **API Error Handling**
```typescript
// Standard error handling pattern
try {
  const result = await apiCall();
  return { data: result, error: null };
} catch (error) {
  console.error('API Error:', error);
  return { data: null, error: error.message };
}
```

## 📋 Commit Standards

### **Conventional Commits**
```
feat: add prayer wall functionality
fix: resolve chat message rendering issue
style: update gradient colors for iOS compliance
docs: update README with setup instructions
test: add unit tests for prayer card component
refactor: optimize FlatList performance
chore: update dependencies
```

### **Branch Naming**
- Feature: `feature/prayer-wall-ui`
- Bug fix: `fix/chat-message-bug`
- Hotfix: `hotfix/critical-crash-fix`
- Chore: `chore/dependency-updates`

## 🔄 Development Workflow

### **Pre-commit Hooks**
- ESLint checks
- TypeScript compilation
- Unit test execution
- Code formatting (Prettier)

### **Code Review Checklist**
- [ ] TypeScript types are properly defined
- [ ] Components follow design system
- [ ] Performance optimizations implemented
- [ ] Tests are included
- [ ] Accessibility features implemented
- [ ] iOS guidelines followed
- [ ] Error handling implemented

## 📦 Build & Deployment

### **Environment Configuration**
```typescript
// Use environment variables for configuration
const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL,
  openaiKey: process.env.EXPO_PUBLIC_OPENAI_KEY,
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
}
```

### **Build Commands**
```bash
# Development build
npx expo run:ios --configuration Debug

# Production build
npx expo build:ios --release-channel production

# Test build
npx expo build:ios --release-channel staging
```

## 🎯 Special Requirements

### **Islamic App Considerations**
- Implement Hijri date support
- Include Qibla direction finder
- Support prayer time calculations
- Use appropriate Islamic greetings
- Respect Islamic UI/UX preferences

### **AI Chat Integration**
- Use context-aware prompting
- Implement proper content filtering
- Provide Islamic perspective in responses
- Include Quran/Hadith references when relevant
- Handle multi-language AI responses

### **Widget Support**
- Implement iOS widgets for daily verses
- Support multiple widget sizes
- Use appropriate refresh intervals
- Maintain consistency with app design

## ⚡ Performance Monitoring

### **Metrics to Track**
- App startup time
- Screen transition performance
- Memory usage
- Battery consumption
- Crash rates
- API response times

### **Tools**
- Flipper for debugging
- React DevTools for component inspection
- Sentry for crash reporting
- Firebase Analytics for usage tracking

---

## 🚫 What NOT to Do

- ❌ Never hardcode API keys in source code
- ❌ Don't use classes for components
- ❌ Avoid inline styles (use StyleSheet.create)
- ❌ Don't ignore TypeScript errors
- ❌ Never commit console.log statements
- ❌ Don't use var declarations
- ❌ Avoid deep nesting (max 3 levels)
- ❌ Don't ignore accessibility requirements
- ❌ Never ship with debug mode enabled
- ❌ Don't use deprecated APIs

---

## ✅ Development Checklist

Before submitting any code:
- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] ESLint shows no errors
- [ ] Component follows design system
- [ ] Performance optimizations applied
- [ ] Accessibility features implemented
- [ ] Error handling included
- [ ] Documentation updated
- [ ] iOS guidelines followed
- [ ] Security considerations addressed

---

**Remember: We're building a spiritual app that should bring peace and guidance to users. Code quality and attention to detail matter!** 🌙✨ 