# Sarathi Construction — Full-Stack Construction Management Website

A premium construction and architecture company website for Sarathi Construction. The application combines a polished public-facing portfolio with a working enquiry workflow and management dashboard.

## Problem Definition

Construction companies need a clear, trustworthy way to present their capabilities, demonstrate completed work, and collect project enquiries. Sarathi Construction centralises these needs in one responsive web application, reducing fragmented communication and giving the company a simple workspace for managing portfolio content and customer conversations.

## Objectives

- Present Sarathi Construction as a premium, reliable construction partner.
- Showcase construction services and sample projects.
- Allow visitors to submit project enquiries with validation and confirmation.
- Store project, service and enquiry records in a persistent database.
- Demonstrate CRUD operations through the management dashboard.
- Provide project detail pages, filtering, responsive layouts and accessible forms.
- Demonstrate a full frontend-to-database integration suitable for an academic project and viva.

## Scope

The public website includes Home, About, Services, Projects, Project Details, Contact and 404 pages. The admin workspace includes overview metrics, project CRUD, service CRUD and enquiry status management. The enquiry workflow stores submissions and sends company/customer email notifications through a secure server-side Edge Function.

## Feasibility

### Technical feasibility

The application uses React and TypeScript for the interface, Supabase Postgres for persistent data, Row Level Security for database access control, and a Supabase Edge Function for server-side email processing.

### Economic feasibility

The architecture uses lightweight open-source frontend tools and managed backend services. It avoids a separate server deployment for the academic demonstration while preserving production-ready separation between browser code and server-side secrets.

### Operational feasibility

Visitors can navigate the public website without training. The admin workspace provides direct actions for the records that a small construction team would manage: portfolio projects, service offerings and incoming enquiries.

## Innovation

The system combines a premium architecture-led presentation with an operational management layer. Enquiry data moves from a validated form into durable storage and an email workflow, while the same data is visible in the admin workspace for follow-up.

## Technologies

- HTML5 semantic structure
- CSS3, Tailwind CSS and responsive media queries
- JavaScript / TypeScript
- ReactJS
- React Router
- Lucide React icons
- Supabase Postgres
- Supabase Row Level Security
- Supabase Edge Functions
- Pexels photography
- SMTP email via the server-side Edge Function

## System Architecture

```text
React Frontend
       ↓
Supabase client / REST-style Data API
       ↓
Supabase Postgres
```

Enquiry email flow:

```text
Contact Form
       ↓
React validation
       ↓
Supabase Edge Function
       ↓
Postgres enquiry record
       ↓
SMTP email service
       ↓
sarathiassociate123@gmail.com + customer acknowledgement
```

## Main Routes

```text
/
/about
/services
/projects
/projects/:id
/contact
/admin
```

The admin area uses internal tabs for overview, projects, services and enquiries.

## Installation

Install dependencies in the project root:

```bash
npm install
```

The project is designed to run with the provided Vite environment. The production build can be checked with:

```bash
npm run build
```

TypeScript validation:

```bash
npm run typecheck
```

## Environment Variables

The application uses the supplied Supabase connection variables in the frontend build environment:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The enquiry Edge Function uses server-side email credentials. These values are never placed in browser code:

```env
EMAIL_USER=sarathiassociate123@gmail.com
EMAIL_PASS=your_server_side_app_password
```

## API / Data Operations

The frontend uses Supabase's REST-style data interface for these operations:

### Projects

- Create project
- List projects
- Read a project by ID
- Update project
- Delete project

### Services

- Create service
- List services
- Read service records
- Update service
- Delete service

### Enquiries

- Create enquiry through the server-side email function
- List enquiries in the admin workspace
- Update enquiry status
- Delete enquiry

Enquiry status values are `New`, `Contacted`, `In Progress`, `Completed` and `Cancelled`.

## Database Schema

### Projects

Stores title, category, location, description, cover image, gallery images, status, scope, project highlights, completion date, featured flag and timestamps.

### Services

Stores title, slug, description, icon name, image, featured flag, ordering and timestamps.

### Enquiries

Stores customer name, email, phone, project type, location, estimated budget, preferred start date, message, status and timestamps.

All tables have Row Level Security enabled and separate policies for select, insert, update and delete operations. This academic demonstration is intentionally single-tenant and does not include a sign-in screen.

## CRUD Demonstration

The `/admin` workspace demonstrates:

- Adding and editing projects.
- Deleting projects with confirmation.
- Adding and editing services.
- Deleting services with confirmation.
- Reviewing enquiries.
- Updating enquiry status.
- Deleting enquiries with confirmation.
- Dashboard totals for projects, services, enquiries and pending follow-up.

## Validation and Error States

The enquiry form validates required fields, email format and phone format before submission. API-driven pages include loading states and empty states. Failed submissions show a visible message instead of silently failing.

## Responsive and Accessibility Notes

- Semantic sections, headings, navigation and form labels are used throughout.
- Images include descriptive alternative text.
- Buttons and fields have visible focus/hover feedback.
- Layouts adapt across desktop, tablet and mobile widths.
- No real phone number or physical address is invented; placeholders are shown where details were not supplied.

## Testing Checklist

1. Open the home page and test navigation.
2. Open Services and confirm service records load.
3. Open Projects and filter by category.
4. Open a project detail page.
5. Submit the Contact form with missing and invalid fields.
6. Submit a valid enquiry and confirm the success message.
7. Open `/admin` and confirm dashboard counts.
8. Add, edit and delete a sample project.
9. Add, edit and delete a sample service.
10. Change an enquiry status and delete an enquiry.
11. Check desktop and mobile widths for overflow and readable text.
12. Run `npm run typecheck` and `npm run build`.

## Academic Rubric Alignment

### Problem definition and objectives

The README defines the real-world problem, objectives, scope, feasibility and innovation.

### UI design

The project demonstrates semantic HTML, responsive CSS, grid/flex layouts, transitions, animations, forms, filtering and interaction states.

### Frontend framework

React reusable UI, route-based pages, `useState`, `useEffect`, custom reveal hooks and modular API helpers are used.

### Backend development

Supabase Data API and Edge Functions provide the server-backed persistence and server-side email layer. The Edge Function validates input, handles errors and prevents email secrets from reaching the browser.

### Database design

Projects, services and enquiries use structured relational tables, constraints, timestamps and RLS policies. CRUD operations are demonstrated in the admin area.

## Demo Data

The seeded portfolio entries are fictional sample projects:

- Sarathi Heights Residence
- Sarathi Business Centre
- Modern Villa Project
- Industrial Warehouse Project
- Contemporary Residence
- Commercial Office Complex

They should be presented as sample/demo work rather than claimed real completed projects.
