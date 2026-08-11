import emailjs from '@emailjs/browser';
import { supabase } from '@/lib/supabase';
import type { Enquiry, EnquiryStatus, Project, Service } from '@/types';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export async function getProjects(featured = false) {
  let query = supabase.from('projects').select('*').order('created_at', { ascending: false });
  if (featured) query = query.eq('featured', true);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Project[];
}

export async function getProject(id: string) {
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Project | null;
}

export async function getServices() {
  const { data, error } = await supabase.from('services').select('*').order('sort_order');
  if (error) throw error;
  return (data || []) as Service[];
}

export async function getEnquiries() {
  const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Enquiry[];
}

export async function createEnquiry(values: Record<string, string>) {
  const { error } = await supabase.from('enquiries').insert({
    name: values.name,
    email: values.email,
    phone: values.phone,
    project_type: values.projectType,
    location: values.location || null,
    budget: values.budget || null,
    preferred_start_date: values.preferredStartDate || null,
    message: values.message,
    status: 'New',
  });
  if (error) throw new Error('Could not save enquiry.');

  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {
      from_name: values.name,
      from_email: values.email,
      phone: values.phone,
      project_type: values.projectType,
      location: values.location || '—',
      budget: values.budget || '—',
      preferred_start_date: values.preferredStartDate || '—',
      message: values.message,
    },
    EMAILJS_PUBLIC_KEY
  );
}

export async function updateEnquiryStatus(id: string, status: EnquiryStatus) {
  const { error } = await supabase.from('enquiries').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function deleteEnquiry(id: string) {
  const { error } = await supabase.from('enquiries').delete().eq('id', id);
  if (error) throw error;
}

export async function saveProject(project: Partial<Project>, id?: string) {
  const { error } = id ? await supabase.from('projects').update(project).eq('id', id) : await supabase.from('projects').insert(project);
  if (error) throw error;
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}

export async function saveService(service: Partial<Service>, id?: string) {
  const { error } = id ? await supabase.from('services').update(service).eq('id', id) : await supabase.from('services').insert(service);
  if (error) throw error;
}

export async function deleteService(id: string) {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
}
