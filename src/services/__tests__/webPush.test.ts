import { describe, it, expect, vi } from 'vitest';
import {
  urlBase64ToUint8Array,
  getVapidPublicKey,
  DEFAULT_VAPID_PUBLIC_KEY,
  isPushSupported,
  isIOS,
  isStandalone,
  detectDeviceType,
  dispatchWebPush,
} from '../webPush';

describe('Web Push Notification Service', () => {
  it('converts URL-safe base64 VAPID public key to Uint8Array properly', () => {
    const key = DEFAULT_VAPID_PUBLIC_KEY;
    const uint8 = urlBase64ToUint8Array(key);
    expect(uint8).toBeInstanceOf(Uint8Array);
    // Uncompressed NIST P-256 public key is always 65 bytes long, starting with 0x04
    expect(uint8.length).toBe(65);
    expect(uint8[0]).toBe(4);
  });

  it('provides a valid default VAPID public key', () => {
    const key = getVapidPublicKey();
    expect(typeof key).toBe('string');
    expect(key.length).toBeGreaterThan(50);
  });

  it('safely evaluates push support without crashing in node/test environment', () => {
    const supported = isPushSupported();
    expect(typeof supported).toBe('boolean');
  });

  it('detects device type correctly', () => {
    const deviceType = detectDeviceType();
    expect(['ios', 'android', 'safari_mac', 'desktop', 'other']).toContain(deviceType);
  });

  it('enforces multi-tenant isolation: rejects push dispatch without vendor_id', async () => {
    const result = await dispatchWebPush({
      vendor_id: '',
      title: 'Test Title',
      message: 'Test Message',
    });
    expect(result.success).toBe(false);
    expect(result.message).toContain('vendor_id is required');
  });
});
