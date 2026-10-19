import { normaliseSupabaseUrl } from '@/services/env';

describe('normaliseSupabaseUrl', () => {
  it.each([
    ['https://abc.supabase.co', 'https://abc.supabase.co'],
    ['https://abc.supabase.co/', 'https://abc.supabase.co'],
    ['https://abc.supabase.co//', 'https://abc.supabase.co'],
    ['https://abc.supabase.co/rest/v1/', 'https://abc.supabase.co'],
    ['https://abc.supabase.co/auth/v1', 'https://abc.supabase.co'],
    ['  https://abc.supabase.co  ', 'https://abc.supabase.co'],
    ['"https://abc.supabase.co"', 'https://abc.supabase.co'],
    ['abc.supabase.co', 'https://abc.supabase.co'],
    ['http://127.0.0.1:54321/', 'http://127.0.0.1:54321'],
    ['', ''],
    ['   ', ''],
  ])('%j -> %j', (input, expected) => {
    expect(normaliseSupabaseUrl(input)).toBe(expected);
  });
});
