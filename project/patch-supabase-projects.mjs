import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const mapping = [
  { find: 'Pune', replace: 'Tiruppur, Tamil Nadu' },
  { find: 'Mumbai', replace: 'Coimbatore, Tamil Nadu' },
  { find: 'Lonavala', replace: 'Erode, Tamil Nadu' },
  { find: 'Nashik', replace: 'Coimbatore, Tamil Nadu' },
  { find: 'Bengaluru', replace: 'Tiruppur, Tamil Nadu' },
  { find: 'Hyderabad', replace: 'Coimbatore, Tamil Nadu' },
  { find: 'Maharashtra', replace: 'Tamil Nadu' },
  { find: 'Karnataka', replace: 'Tamil Nadu' },
  { find: 'Telangana', replace: 'Tamil Nadu' },
];
const { data, error } = await supabase.from('projects').select('id,title,location,description');
if (error) throw error;
const updates = [];
for (const row of data) {
  let location = row.location || '';
  let description = row.description || '';
  let changed = false;
  for (const { find, replace } of mapping) {
    if (location.includes(find)) {
      location = location.replace(find, replace);
      changed = true;
    }
    if (description.includes(find)) {
      description = description.replace(new RegExp(find, 'g'), replace);
      changed = true;
    }
  }
  if (changed) {
    updates.push({ id: row.id, location, description });
  }
}
console.log('Found rows to update:', updates.length);
for (const u of updates) {
  const { error: upErr } = await supabase.from('projects').update({ location: u.location, description: u.description }).eq('id', u.id);
  if (upErr) throw upErr;
  console.log('Updated', u.id, u.location);
}
console.log('Done');
