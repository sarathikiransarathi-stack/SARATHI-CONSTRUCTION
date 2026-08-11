export type ProjectCategory = 'Residential' | 'Commercial' | 'Industrial' | 'Renovation';
export type ProjectStatus = 'Completed' | 'In Progress' | 'Planned';
export type EnquiryStatus = 'New' | 'Contacted' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  location: string;
  description: string;
  image: string;
  gallery: string[];
  status: ProjectStatus;
  scope: string | null;
  highlights: string[];
  completion_date: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  image: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  project_type: string;
  location: string | null;
  budget: string | null;
  preferred_start_date: string | null;
  message: string;
  status: EnquiryStatus;
  created_at: string;
  updated_at: string;
}
