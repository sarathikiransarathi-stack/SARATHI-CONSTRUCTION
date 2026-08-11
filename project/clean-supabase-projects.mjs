import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const { data, error } = await supabase.from('projects').select('id,title,location,description');
if (error) throw error;
const updates = [];
for (const row of data) {
  let location = row.location || '';
  let description = row.description || '';
  let changed = false;
  const normalizedLocation = location.replace(/,\s*Tamil Nadu,\s*Tamil Nadu/g, ', Tamil Nadu').replace(/Tamil Nadu,\s*Tamil Nadu/g, 'Tamil Nadu');
  if (normalizedLocation !== location) { location = normalizedLocation; changed = true; }
  const normalizedDescription = description.replace(/Tamil Nadu,\s*Tamil Nadu/g, 'Tamil Nadu');
  if (normalizedDescription !== description) { description = normalizedDescription; changed = true; }
  if (changed) updates.push({ id: row.id, location, description });
}
console.log('Clean updates:', updates.length);
for (const u of updates) {
  const { error: upErr } = await supabase.from('projects').update({ location: u.location, description: u.description }).eq('id', u.id);
  if (upErr) throw upErr;
  console.log('Cleaned', u.id, u.location);
}
const { data: confirmData, error: confirmError } = await supabase.from('projects').select('id,title,location').order('created_at',{ascending:true});
if (confirmError) throw confirmError;
console.log(JSON.stringify(confirmData, null, 2));
