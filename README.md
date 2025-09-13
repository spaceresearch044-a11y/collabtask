# CollabTask - Team Collaboration Platform

A modern team collaboration platform with 3D task visualization, real-time updates, and comprehensive project management features.

## Features

- **Projects**: Create individual or team projects with role-based access
- **Tasks**: Kanban-style task management with 3D visualization
- **Calendar**: Schedule events and track deadlines
- **Meeting Room**: Virtual collaboration hub (coming soon)
- **Files**: Secure cloud storage and file sharing (coming soon)
- **Reports**: Analytics and insights (coming soon)

## Data Storage

All data is stored in Supabase with the following structure:

### Core Tables

- **profiles**: User profiles with roles, points, and settings
- **projects**: Project containers with metadata and team codes
- **project_members**: Many-to-many relationship for project membership
- **tasks**: Individual tasks with status, priority, and assignments
- **team_codes**: Temporary codes for joining team projects
- **activity_logs**: Audit trail of all user actions

### Additional Tables (Future)

- **calendar_events**: Scheduled events and deadlines
- **meetings**: Virtual meeting rooms and recordings
- **files**: File metadata and storage references
- **comments**: Task and project discussions
- **reports**: Generated analytics and insights

### Security

- Row Level Security (RLS) enabled on all tables
- Role-based permissions (lead, member, viewer)
- Secure file storage with access controls
- Activity logging for audit trails

## Environment Setup

Create a `.env` file with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development

```bash
npm install
npm run dev
```

## Database Migrations

Run the included migrations to set up the database schema:

1. `20250912105344_lively_glade.sql` - Profiles table
2. `20250912105358_teal_limit.sql` - Projects table  
3. `20250912105409_quiet_temple.sql` - Tasks table
4. `20250912113546_lively_grove.sql` - Profile policies
5. `20250912114123_holy_star.sql` - Complete schema
6. `20250112120000_fix_missing_columns.sql` - Bug fixes and optimizations
