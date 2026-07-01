import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { triggerButtonPressHaptic, triggerErrorHaptic } from '../utils/haptics';
import { hp, rf, wp } from '../utils/responsive';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Trigger error haptic
    triggerErrorHaptic();
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to crash reporting service (Sentry, Crashlytics, etc.)
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // This would integrate with Sentry or another crash reporting service
      console.warn('Error logged to crash reporting service:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
      
      // Example integration:
      // Sentry.captureException(error, {
      //   contexts: {
      //     react: {
      //       componentStack: errorInfo.componentStack,
      //     },
      //   },
      // });
    } catch (loggingError) {
      console.error('Failed to log error to service:', loggingError);
    }
  };

  private handleRetry = () => {
    triggerButtonPressHaptic();
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleReload = () => {
    triggerButtonPressHaptic();
    // This would reload the app or navigate to home screen
    console.log('App reload requested');
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <LinearGradient colors={['#0f0f23', '#1a1a2e', '#16213e']} style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1, padding: wp(6) }}>
            <ScrollView 
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
              showsVerticalScrollIndicator={false}
            >
              {/* Error Icon */}
              <View style={{
                alignItems: 'center',
                marginBottom: hp(4)
              }}>
                <View style={{
                  width: wp(20),
                  height: wp(20),
                  borderRadius: wp(10),
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: hp(3)
                }}>
                  <Ionicons name="warning" size={wp(10)} color="#ef4444" />
                </View>
                
                <Text style={{
                  fontSize: rf(24),
                  fontWeight: 'bold',
                  color: '#ffffff',
                  textAlign: 'center',
                  marginBottom: hp(2)
                }}>
                  Bir Sorun Oluştu
                </Text>
                
                <Text style={{
                  fontSize: rf(16),
                  color: '#94a3b8',
                  textAlign: 'center',
                  lineHeight: rf(24)
                }}>
                  Uygulamada beklenmeyen bir hata meydana geldi. Bu sorunu çözmek için çalışıyoruz.
                </Text>
              </View>

              {/* Error Details (Development Mode) */}
              {__DEV__ && this.state.error && (
                <View style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: wp(3),
                  padding: wp(4),
                  marginBottom: hp(4),
                  borderWidth: 1,
                  borderColor: 'rgba(239, 68, 68, 0.3)'
                }}>
                  <Text style={{
                    fontSize: rf(14),
                    fontWeight: '600',
                    color: '#ef4444',
                    marginBottom: hp(2)
                  }}>
                    Hata Detayları (Geliştirici Modu):
                  </Text>
                  
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={{ maxHeight: hp(15) }}
                  >
                    <Text style={{
                      fontSize: rf(12),
                      color: '#fca5a5',
                      fontFamily: 'monospace'
                    }}>
                      {this.state.error.message}
                      {'\n\n'}
                      {this.state.error.stack}
                    </Text>
                  </ScrollView>
                </View>
              )}

              {/* Action Buttons */}
              <View style={{ gap: hp(2) }}>
                {/* Retry Button */}
                <TouchableOpacity onPress={this.handleRetry}>
                  <LinearGradient
                    colors={['#8b5cf6', '#a78bfa']}
                    style={{
                      borderRadius: wp(3),
                      padding: wp(4),
                      alignItems: 'center',
                      shadowColor: '#8b5cf6',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 8
                    }}
                  >
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}>
                      <Ionicons name="refresh" size={wp(5)} color="#ffffff" />
                      <Text style={{
                        fontSize: rf(16),
                        fontWeight: '600',
                        color: '#ffffff',
                        marginLeft: wp(2)
                      }}>
                        Tekrar Dene
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Reload App Button */}
                <TouchableOpacity onPress={this.handleReload}>
                  <View style={{
                    borderRadius: wp(3),
                    padding: wp(4),
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}>
                      <Ionicons name="home" size={wp(5)} color="#94a3b8" />
                      <Text style={{
                        fontSize: rf(16),
                        fontWeight: '600',
                        color: '#94a3b8',
                        marginLeft: wp(2)
                      }}>
                        Ana Sayfaya Dön
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Help Text */}
              <View style={{
                marginTop: hp(4),
                alignItems: 'center'
              }}>
                <Text style={{
                  fontSize: rf(14),
                  color: '#64748b',
                  textAlign: 'center',
                  lineHeight: rf(20)
                }}>
                  Sorun devam ederse, uygulamayı yeniden başlatmayı deneyin.
                  Teknik destek için ayarlar bölümünden iletişime geçebilirsiniz.
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorFallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={errorFallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// React Hook for error handling
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    console.error('Handled error:', error);
    triggerErrorHaptic();
    setError(error);
  }, []);

  // Throw error to be caught by error boundary
  if (error) {
    throw error;
  }

  return {
    handleError,
    resetError
  };
};

// Global error handler setup
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Log to crash reporting service
  };

  // Handle global JavaScript errors
  const handleGlobalError = (event: ErrorEvent) => {
    console.error('Global error:', event.error);
    // Log to crash reporting service
  };

  // React Native specific error handling
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);
  }

  // Set up error handlers
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Log errors but don't spam in development
    if (!__DEV__ || args[0]?.includes?.('Warning:') === false) {
      originalConsoleError(...args);
    }
  };
};

export default ErrorBoundary; 