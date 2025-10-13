import { NativeModules, NativeEventEmitter, EmitterSubscription } from 'react-native';

interface FloatingOverlayModule {
  showFloatingOverlay(phoneNumber: string, leadName: string): Promise<string>;
  hideFloatingOverlay(): Promise<string>;
  stopFloatingOverlay(): Promise<string>;
  testBroadcast(): Promise<string>;
}

const { FloatingOverlayModule, SimpleFloatingModule } = NativeModules;

// Debug module availability
console.log('[NATIVE_OVERLAY] 🔍 Module availability check:');
console.log('[NATIVE_OVERLAY] - NativeModules object:', Object.keys(NativeModules));
console.log('[NATIVE_OVERLAY] - FloatingOverlayModule:', FloatingOverlayModule);
console.log('[NATIVE_OVERLAY] - SimpleFloatingModule:', SimpleFloatingModule);
console.log('[NATIVE_OVERLAY] - Available modules:', Object.keys(NativeModules).filter(key => key.includes('Float')));

class NativeFloatingOverlayService {
  private eventEmitter: NativeEventEmitter | null = null;
  private overlayClickListener: EmitterSubscription | null = null;
  private isModuleAvailable: boolean = false;

  constructor() {
    console.log('[NATIVE_OVERLAY] 🏗️ Constructor called');
    console.log('[NATIVE_OVERLAY] FloatingOverlayModule available:', !!FloatingOverlayModule);
    
    this.isModuleAvailable = !!FloatingOverlayModule;
    
    if (!FloatingOverlayModule) {
      console.warn('[NATIVE_OVERLAY] ⚠️ FloatingOverlayModule is not available! This is expected in development.');
      console.warn('[NATIVE_OVERLAY] Available modules:', Object.keys(NativeModules));
      console.warn('[NATIVE_OVERLAY] App will continue to work, but floating overlay features will be disabled.');
      return; // Don't throw error, just log warning
    }
    
    try {
      this.eventEmitter = new NativeEventEmitter(FloatingOverlayModule);
      console.log('[NATIVE_OVERLAY] ✅ NativeEventEmitter created successfully');
      console.log('[NATIVE_OVERLAY] Event emitter object:', this.eventEmitter);
    } catch (error) {
      console.error('[NATIVE_OVERLAY] ❌ Error creating NativeEventEmitter:', error);
      this.isModuleAvailable = false;
      this.eventEmitter = null;
    }
  }

  /**
   * Show floating overlay over other apps (including dialer)
   */
  async showFloatingOverlay(phoneNumber: string, leadName?: string): Promise<boolean> {
    if (!this.isModuleAvailable || !FloatingOverlayModule) {
      console.warn('[NATIVE_OVERLAY] ⚠️ Cannot show floating overlay - module not available');
      return false;
    }
    
    try {
      console.log('[NATIVE_OVERLAY] Showing floating overlay:', phoneNumber, leadName);
      
      const displayName = leadName || 'Unknown Contact';
      await FloatingOverlayModule.showFloatingOverlay(phoneNumber, displayName);
      
      console.log('[NATIVE_OVERLAY] ✅ Native overlay shown successfully');
      return true;
    } catch (error) {
      console.error('[NATIVE_OVERLAY] ❌ Error showing native overlay:', error);
      return false;
    }
  }

  /**
   * Hide floating overlay
   */
  async hideFloatingOverlay(): Promise<boolean> {
    if (!this.isModuleAvailable || !FloatingOverlayModule) {
      console.warn('[NATIVE_OVERLAY] ⚠️ Cannot hide floating overlay - module not available');
      return false;
    }
    
    try {
      console.log('[NATIVE_OVERLAY] Hiding floating overlay');
      await FloatingOverlayModule.hideFloatingOverlay();
      
      console.log('[NATIVE_OVERLAY] ✅ Native overlay hidden successfully');
      return true;
    } catch (error) {
      console.error('[NATIVE_OVERLAY] ❌ Error hiding native overlay:', error);
      return false;
    }
  }

  /**
   * Stop floating overlay service completely
   */
  async stopFloatingOverlay(): Promise<boolean> {
    try {
      console.log('[NATIVE_OVERLAY] Stopping floating overlay service');
      await FloatingOverlayModule.stopFloatingOverlay();
      
      console.log('[NATIVE_OVERLAY] ✅ Native overlay service stopped');
      return true;
    } catch (error) {
      console.error('[NATIVE_OVERLAY] ❌ Error stopping native overlay service:', error);
      return false;
    }
  }

  /**
   * Listen for overlay click events
   */
  onOverlayClick(callback: () => void): () => void {
    console.log('[NATIVE_OVERLAY] 🎧 Setting up overlay click listener...');
    console.log('[NATIVE_OVERLAY] Module available:', this.isModuleAvailable);
    console.log('[NATIVE_OVERLAY] Event emitter available:', !!this.eventEmitter);
    console.log('[NATIVE_OVERLAY] FloatingOverlayModule available:', !!FloatingOverlayModule);
    
    if (!this.isModuleAvailable || !this.eventEmitter) {
      console.warn('[NATIVE_OVERLAY] ⚠️ Event emitter not available, cannot set up listener');
      return () => {};
    }
    
    try {
      // Test event emitter before setting up the real listener
      console.log('[NATIVE_OVERLAY] 🧪 Testing event emitter with dummy listener...');
      const testListener = this.eventEmitter.addListener('test', () => {
        console.log('[NATIVE_OVERLAY] Test event received');
      });
      testListener.remove();
      console.log('[NATIVE_OVERLAY] ✅ Event emitter test successful');
      
      // Set up the actual listener
      console.log('[NATIVE_OVERLAY] 📡 Adding listener for "FloatingOverlayClicked" event');
      this.overlayClickListener = this.eventEmitter.addListener(
        'FloatingOverlayClicked',
        (data) => {
          console.log('[NATIVE_OVERLAY] 🎯 ========================================');
          console.log('[NATIVE_OVERLAY] 🎯 FLOATING OVERLAY CLICKED EVENT RECEIVED!');
          console.log('[NATIVE_OVERLAY] 🎯 This means the native->RN communication is working!');
          console.log('[NATIVE_OVERLAY] 🎯 Event data:', data);
          console.log('[NATIVE_OVERLAY] 🎯 Timestamp:', new Date().toISOString());
          console.log('[NATIVE_OVERLAY] 🎯 Calling React Native callback...');
          console.log('[NATIVE_OVERLAY] 🎯 ========================================');
          
          try {
            callback();
            console.log('[NATIVE_OVERLAY] ✅ Callback executed successfully');
          } catch (error) {
            console.error('[NATIVE_OVERLAY] ❌ Error in callback:', error);
          }
        }
      );
      
      console.log('[NATIVE_OVERLAY] ✅ Overlay click listener set up successfully');
      console.log('[NATIVE_OVERLAY] Listener object:', this.overlayClickListener);
      
    } catch (error) {
      console.error('[NATIVE_OVERLAY] ❌ Error setting up overlay click listener:', error);
      return () => {};
    }

    // Return cleanup function
    return () => {
      if (this.overlayClickListener) {
        console.log('[NATIVE_OVERLAY] 🧹 Removing overlay click listener');
        this.overlayClickListener.remove();
        this.overlayClickListener = null;
        console.log('[NATIVE_OVERLAY] ✅ Overlay click listener removed');
      }
    };
  }

  /**
   * Test broadcast communication (for debugging)
   */
  async testBroadcast(): Promise<boolean> {
    if (!this.isModuleAvailable || !FloatingOverlayModule) {
      console.warn('[NATIVE_OVERLAY] ⚠️ Cannot test broadcast - module not available');
      return false;
    }
    
    try {
      console.log('[NATIVE_OVERLAY] 🧪 ========================================');
      console.log('[NATIVE_OVERLAY] 🧪 TESTING BROADCAST COMMUNICATION');
      console.log('[NATIVE_OVERLAY] 🧪 This will test if native module can send events to React Native');
      console.log('[NATIVE_OVERLAY] 🧪 ========================================');
      
      console.log('[NATIVE_OVERLAY] 🧪 Module availability check:');
      console.log('[NATIVE_OVERLAY] 🧪 - FloatingOverlayModule:', !!FloatingOverlayModule);
      console.log('[NATIVE_OVERLAY] 🧪 - Event emitter:', !!this.eventEmitter);
      console.log('[NATIVE_OVERLAY] 🧪 - Click listener active:', !!this.overlayClickListener);
      
      console.log('[NATIVE_OVERLAY] 🧪 Calling native testBroadcast method...');
      const result = await FloatingOverlayModule.testBroadcast();
      console.log('[NATIVE_OVERLAY] 🧪 Native testBroadcast result:', result);
      console.log('[NATIVE_OVERLAY] ✅ Test broadcast call successful');
      console.log('[NATIVE_OVERLAY] 🧪 Now check logs for "FLOATING OVERLAY CLICKED EVENT RECEIVED!" message');
      
      return true;
    } catch (error) {
      console.error('[NATIVE_OVERLAY] ❌ Test broadcast failed:', error);
      console.error('[NATIVE_OVERLAY] ❌ Error details:', error?.message, error?.code);
      return false;
    }
  }

  /**
   * Manual test - simulate overlay click for debugging
   */
  async testOverlayClick(): Promise<boolean> {
    try {
      console.log('[NATIVE_OVERLAY] 🧪 ========================================');
      console.log('[NATIVE_OVERLAY] 🧪 MANUAL OVERLAY CLICK TEST STARTED');
      console.log('[NATIVE_OVERLAY] 🧪 This simulates clicking the floating icon');
      console.log('[NATIVE_OVERLAY] 🧪 ========================================');
      
      // First ensure listener is set up
      if (!this.overlayClickListener) {
        console.log('[NATIVE_OVERLAY] 🧪 No listener active, this might be why clicks don\'t work');
        return false;
      }
      
      console.log('[NATIVE_OVERLAY] 🧪 Listener is active, proceeding with test...');
      const success = await this.testBroadcast();
      
      if (success) {
        console.log('[NATIVE_OVERLAY] ✅ Manual overlay click test completed successfully');
        console.log('[NATIVE_OVERLAY] ✅ If you see "FLOATING OVERLAY CLICKED EVENT RECEIVED!" above, the communication works!');
      } else {
        console.log('[NATIVE_OVERLAY] ❌ Manual overlay click test failed');
      }
      
      return success;
    } catch (error) {
      console.error('[NATIVE_OVERLAY] ❌ Manual overlay click test failed:', error);
      return false;
    }
  }

  /**
   * Check if native module is available
   */
  isAvailable(): boolean {
    console.log('[NATIVE_OVERLAY] Checking module availability...');
    console.log('[NATIVE_OVERLAY] isModuleAvailable flag:', this.isModuleAvailable);
    console.log('[NATIVE_OVERLAY] SimpleFloatingModule:', SimpleFloatingModule != null);
    console.log('[NATIVE_OVERLAY] FloatingOverlayModule:', FloatingOverlayModule != null);
    
    // Test simple module first (only if available)
    if (SimpleFloatingModule) {
      SimpleFloatingModule.testMethod()
        .then((result: string) => {
          console.log('[NATIVE_OVERLAY] Simple module test successful:', result);
        })
        .catch((error: any) => {
          console.log('[NATIVE_OVERLAY] Simple module test failed:', error);
        });
    }
    
    return this.isModuleAvailable;
  }
}

export default new NativeFloatingOverlayService();