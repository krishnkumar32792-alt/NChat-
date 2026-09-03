import { supabase } from './supabase';

export async function testSupabase() {
  const { error } = await supabase
    .from('messages')
    .select('id')
    .limit(1);

  if (error) {
    console.log('SUPABASE_TEST:', error.message);
    return false;
  }

  console.log('SUPABASE_TEST: CONNECTED');
  return true;
}
