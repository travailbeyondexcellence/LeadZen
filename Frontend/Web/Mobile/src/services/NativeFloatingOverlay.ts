import { NativeModules, NativeEventEmitter, EmitterSubscription } from 'react-native';

interface FloatingOverlayModule {
  showFloatingOverlay(phoneNumber: string, leadName: string): Promise<string>;
  hideFloatingOverlay(): Promise<string>;
  stopFloatingOverlay(): Promise<string>;
  testBroadcast(): Promise<string>;
}

const { FloatingOverlayModule, SimpleFloatingModule } = NativeModules;

class NativeFloatingOverlayService {
  private eventEmitter: NativeEventEmitter;
  private overlayClickListener: EmitterSubscription | null = null;

  constructor() {
    this.eventEmitter = new NativeEventEmitter(FloatingOverlayModule);
  }

  /**
   * Show floating overlay over other apps (including dialer)
   */
  async showFloatingOverlay(phoneNumber: string, leadName?: string): Promise<boolean> {
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
    console.log('[NATIVE_OVERLAY] Setting up overlay click listener');
    
    this.overlayClickListener = this.eventEmitter.addListener(
      'FloatingOverlayClicked',
      () => {
        console.log('[NATIVE_OVERLAY] 👆 Native overlay clicked!');
        callback();
      }
    );

    // Return cleanup function
    return () => {
      if (this.overlayClickListener) {
        this.overlayClickListener.remove();
        this.overlayClickListener = null;
        console.log('[NATIVE_OVERLAY] Overlay click listener removed');
      }
    };
  }

  /**
   * Test broadcast communication (for debugging)
   */
  async testBroadcast(): Promise<boolean> {
    try {
      console.log('[NATIVE_OVERLAY] Testing broadcast communication...');
      const result = await FloatingOverlayModule.testBroadcast();
      console.log('[NATIVE_OVERLAY] ✅ Test broadcast successful:', result);
      return true;
    } catch (error) {
      console.error('[NATIVE_OVERLAY] ❌ Test broadcast failed:', error);
      return false;
    }
  }

  /**
   * Check if native module is available
   */
  isAvailable(): boolean {
    console.log('[NATIVE_OVERLAY] Checking module availability...');
    console.log('[NATIVE_OVERLAY] SimpleFloatingModule:', SimpleFloatingModule != null);
    console.log('[NATIVE_OVERLAY] FloatingOverlayModule:', FloatingOverlayModule != null);
    
    // Test simple module first
    if (SimpleFloatingModule) {
      SimpleFloatingModule.testMethod()
        .then((result: string) => {
          console.log('[NATIVE_OVERLAY] Simple module test successful:', result);
        })
        .catch((error: any) => {
          console.log('[NATIVE_OVERLAY] Simple module test failed:', error);
        });
    }
    
    return FloatingOverlayModule != null;
  }
}

export default new NativeFloatingOverlayService();