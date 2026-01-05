/**
 * AdSessionManager - Manages ad viewing sessions and unlock states
 * 
 * This service handles:
 * - Session storage for unlock states
 * - Session validation and expiration logic (4-minute duration)
 * - Session state persistence across page navigation
 * - Unique session identifier generation
 */

export interface AdSession {
  unlockedAt: number; // timestamp
  expiresAt: number; // timestamp
  sessionId: string;
}

export class AdSessionManager {
  private static readonly SESSION_KEY = 'ad_gate_session';
  private static readonly SESSION_DURATION = 4 * 60 * 1000; // 4 minutes in milliseconds

  /**
   * Check if agent details are currently unlocked
   * @returns boolean indicating if details are unlocked
   */
  static isUnlocked(): boolean {
    try {
      const session = this.getSession();
      if (!session) return false;

      const now = Date.now();
      return now < session.expiresAt;
    } catch (error) {
      // console.warn('Error checking unlock status:', error);
      this.clearSession();
      return false;
    }
  }

  /**
   * Set agent details as unlocked for the specified duration
   * @param duration Duration in milliseconds (defaults to 4 minutes)
   */
  static setUnlocked(duration: number = this.SESSION_DURATION): void {
    try {
      const now = Date.now();
      const session: AdSession = {
        unlockedAt: now,
        expiresAt: now + duration,
        sessionId: this.generateSessionId()
      };

      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      }
    } catch (error) {
      // console.warn('Error setting unlock state:', error);
    }
  }

  /**
   * Get remaining time in milliseconds before session expires
   * @returns number of milliseconds remaining, or 0 if expired/no session
   */
  static getRemainingTime(): number {
    try {
      const session = this.getSession();
      if (!session) return 0;

      const now = Date.now();
      const remaining = session.expiresAt - now;
      return Math.max(0, remaining);
    } catch (error) {
      // console.warn('Error getting remaining time:', error);
      return 0;
    }
  }

  /**
   * Get remaining time formatted as MM:SS
   * @returns string formatted time or empty string if expired
   */
  static getRemainingTimeFormatted(): string {
    const remaining = this.getRemainingTime();
    if (remaining <= 0) return '';

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Clear the current session
   */
  static clearSession(): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem(this.SESSION_KEY);
      }
    } catch (error) {
      // console.warn('Error clearing session:', error);
    }
  }

  /**
   * Get the current session from storage
   * @returns AdSession object or null if no valid session
   */
  static getSession(): AdSession | null {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) {
        return null;
      }

      const sessionData = sessionStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;

      const session: AdSession = JSON.parse(sessionData);
      
      // Validate session structure
      if (!session.unlockedAt || !session.expiresAt || !session.sessionId) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      // console.warn('Error retrieving session:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Get the current session ID
   * @returns string session ID or null if no session
   */
  static getSessionId(): string | null {
    const session = this.getSession();
    return session?.sessionId || null;
  }

  /**
   * Check if session storage is available
   * @returns boolean indicating if session storage is supported
   */
  static isStorageAvailable(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      const test = '__storage_test__';
      window.sessionStorage.setItem(test, test);
      window.sessionStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate a unique session identifier
   * @returns string unique session ID
   */
  private static generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `ad_session_${timestamp}_${randomPart}`;
  }

  /**
   * Extend current session by additional time
   * @param additionalTime Additional time in milliseconds
   */
  static extendSession(additionalTime: number): void {
    try {
      const session = this.getSession();
      if (!session) return;

      session.expiresAt += additionalTime;
      
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      }
    } catch (error) {
      // console.warn('Error extending session:', error);
    }
  }

  /**
   * Get session statistics for analytics
   * @returns object with session stats
   */
  static getSessionStats(): {
    hasActiveSession: boolean;
    sessionAge: number;
    remainingTime: number;
    sessionId: string | null;
  } {
    const session = this.getSession();
    const now = Date.now();

    return {
      hasActiveSession: this.isUnlocked(),
      sessionAge: session ? now - session.unlockedAt : 0,
      remainingTime: this.getRemainingTime(),
      sessionId: this.getSessionId()
    };
  }
}

export default AdSessionManager;