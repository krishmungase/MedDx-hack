import RoleShell from '@/components/shared/role-shell'

import AdminSidebar from './components/admin-sidebar'

const SECTIONS = {
  '/admin': 'Overview',
  '/admin/doctors': 'Doctors',
  '/admin/appointments': 'Appointments',
  '/admin/audit-log': 'Audit log',
}

const AdminLayout = () => (
  <RoleShell
    eyebrow="Admin · Console"
    sections={SECTIONS}
    sidebar={<AdminSidebar />}
  />
)

export default AdminLayout
