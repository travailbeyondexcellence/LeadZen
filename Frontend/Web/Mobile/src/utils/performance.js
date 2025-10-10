import { InteractionManager, Platform } from 'react-native';

export class PerformanceMonitor {
  static measurements = new Map();
  static isEnabled = __DEV__;

  static startMeasurement(name) {
    if (!this.isEnabled) return;
    
    this.measurements.set(name, {
      startTime: Date.now(),
      startMemory: this.getMemoryUsage(),
    });
    
    console.log(`🚀 Performance: Started measuring "${name}"`);
  }

  static endMeasurement(name) {
    if (!this.isEnabled) return;
    
    const measurement = this.measurements.get(name);
    if (!measurement) {
      console.warn(`⚠️ Performance: No measurement found for "${name}"`);
      return;
    }

    const endTime = Date.now();
    const endMemory = this.getMemoryUsage();
    const duration = endTime - measurement.startTime;
    const memoryDelta = endMemory - measurement.startMemory;

    console.log(`✅ Performance: "${name}" completed in ${duration}ms`);
    console.log(`📊 Memory delta: ${memoryDelta.toFixed(2)}MB`);

    this.measurements.delete(name);
    return { duration, memoryDelta };
  }

  static measureAsync(name, asyncFunction) {
    if (!this.isEnabled) {
      return asyncFunction();
    }

    this.startMeasurement(name);
    
    return Promise.resolve(asyncFunction())
      .then(result => {
        this.endMeasurement(name);
        return result;
      })
      .catch(error => {
        this.endMeasurement(name);
        throw error;
      });
  }

  static measureComponent(ComponentName) {
    return function(WrappedComponent) {
      return function MeasuredComponent(props) {
        React.useEffect(() => {
          PerformanceMonitor.startMeasurement(`${ComponentName} mount`);
          
          return () => {
            PerformanceMonitor.endMeasurement(`${ComponentName} mount`);
          };
        }, []);

        return React.createElement(WrappedComponent, props);
      };
    };
  }

  static getMemoryUsage() {
    if (Platform.OS === 'android') {
      // Android memory monitoring would require native module
      return 0;
    }
    
    // iOS memory monitoring would also require native module
    return 0;
  }

  static logRenderTime(componentName, renderFunction) {
    if (!this.isEnabled) {
      return renderFunction();
    }

    const startTime = Date.now();
    const result = renderFunction();
    const endTime = Date.now();
    
    const renderTime = endTime - startTime;
    if (renderTime > 16) { // More than 1 frame at 60fps
      console.warn(`🐌 Slow render: ${componentName} took ${renderTime}ms`);
    }
    
    return result;
  }

  static scheduleAfterInteractions(callback) {
    InteractionManager.runAfterInteractions(() => {
      callback();
    });
  }

  static getBundleSize() {
    // This would require build-time analysis
    // For now, just log a placeholder
    console.log('📦 Bundle size analysis would require build-time tools');
  }

  static trackUserFlow(flowName) {
    if (!this.isEnabled) return;
    
    console.log(`👤 User Flow: Started "${flowName}"`);
    
    return {
      step: (stepName) => {
        console.log(`👤 User Flow: "${flowName}" - ${stepName}`);
      },
      complete: () => {
        console.log(`✅ User Flow: "${flowName}" completed`);
      },
      abandon: (reason) => {
        console.log(`❌ User Flow: "${flowName}" abandoned - ${reason}`);
      },
    };
  }

  static optimizeListRendering() {
    return {
      getItemLayout: (data, index) => ({
        length: 80, // Estimated item height
        offset: 80 * index,
        index,
      }),
      keyExtractor: (item, index) => item.id?.toString() || index.toString(),
      removeClippedSubviews: true,
      maxToRenderPerBatch: 10,
      updateCellsBatchingPeriod: 50,
      initialNumToRender: 10,
      windowSize: 10,
    };
  }

  static debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  static generatePerformanceReport() {
    const report = {
      platform: Platform.OS,
      version: Platform.Version,
      timestamp: new Date().toISOString(),
      activeMeasurements: Array.from(this.measurements.keys()),
      recommendations: this.getPerformanceRecommendations(),
    };

    console.log('📊 Performance Report:', JSON.stringify(report, null, 2));
    return report;
  }

  static getPerformanceRecommendations() {
    return [
      'Use FlatList for long lists instead of ScrollView',
      'Implement proper shouldComponentUpdate or React.memo',
      'Avoid inline functions in render methods',
      'Use Image caching for frequently displayed images',
      'Minimize bridge calls between JS and native',
      'Use Hermes engine for better performance',
      'Enable RAM bundles for faster startup',
    ];
  }
}

export const withPerformanceMonitoring = (componentName) => (WrappedComponent) => {
  return function PerformanceMonitoredComponent(props) {
    React.useEffect(() => {
      PerformanceMonitor.startMeasurement(`${componentName} lifecycle`);
      
      return () => {
        PerformanceMonitor.endMeasurement(`${componentName} lifecycle`);
      };
    }, []);

    return React.createElement(WrappedComponent, props);
  };
};