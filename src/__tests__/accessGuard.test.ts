import { decideAccess, isPublicPath } from '@/services/accessGuard';

const base = { configured: true, loading: false, signedIn: false, recovering: false };

describe('access guard', () => {
  it('sends signed-out visitors to the landing page instead of the learning portal', () => {
    for (const pathname of ['/', '/learn', '/learn/fundamentals/f-first-program', '/practice', '/admin', '/settings/account', '/progress']) {
      expect(decideAccess({ ...base, pathname })).toEqual({ action: 'redirect', to: '/welcome' });
    }
  });

  it('keeps the landing page and auth screens public', () => {
    for (const pathname of ['/welcome', '/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/sign-in/']) {
      expect(decideAccess({ ...base, pathname })).toEqual({ action: 'allow' });
    }
    expect(isPublicPath('/learn')).toBe(false);
    expect(isPublicPath('/welcome-fake')).toBe(false);
  });

  it('waits for the stored session before deciding, so signed-in users never flash the landing page', () => {
    expect(decideAccess({ ...base, loading: true, pathname: '/learn' })).toEqual({ action: 'wait' });
  });

  it('opens the portal to signed-in learners and moves them off guest-only screens', () => {
    const signed = { ...base, signedIn: true };
    expect(decideAccess({ ...signed, pathname: '/' })).toEqual({ action: 'allow' });
    expect(decideAccess({ ...signed, pathname: '/learn/oop' })).toEqual({ action: 'allow' });
    for (const pathname of ['/welcome', '/forgot-password']) {
      expect(decideAccess({ ...signed, pathname })).toEqual({ action: 'redirect', to: '/' });
    }
    // The sign-in screen forwards to the requested page itself (?redirect=...).
    expect(decideAccess({ ...signed, pathname: '/sign-in' })).toEqual({ action: 'allow' });
    expect(decideAccess({ ...signed, pathname: '/reset-password' })).toEqual({ action: 'allow' });
  });

  it('forces a password-recovery session to choose a new password first', () => {
    expect(decideAccess({ ...base, signedIn: true, recovering: true, pathname: '/learn' })).toEqual({ action: 'redirect', to: '/reset-password' });
    expect(decideAccess({ ...base, signedIn: true, recovering: true, pathname: '/reset-password' })).toEqual({ action: 'allow' });
  });

  it('does not gate anything in local-only builds without accounts', () => {
    for (const pathname of ['/', '/learn', '/welcome', '/sign-in']) {
      expect(decideAccess({ ...base, configured: false, pathname })).toEqual({ action: 'allow' });
    }
  });
});
