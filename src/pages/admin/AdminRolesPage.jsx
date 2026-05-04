import { useMemo } from "react";
import { useAdminOutlet } from "./useAdminOutlet";
import { formatDateTime } from "./utils";

const permissionsMatrix = [
  { permission: "View analytics", super_admin: true, moderator: true, support: true },
  { permission: "Suspend / Ban users", super_admin: true, moderator: true, support: false },
  { permission: "Resolve reports", super_admin: true, moderator: true, support: true },
  { permission: "Edit billing plans", super_admin: true, moderator: false, support: false },
  { permission: "Change platform settings", super_admin: true, moderator: false, support: false },
];

function AdminRolesPage() {
  const { users } = useAdminOutlet();
  const adminUsers = useMemo(() => users.filter((item) => item.role === "admin"), [users]);

  return (
    <div className="space-y-6">
      <section className="glass rounded-3xl p-5">
        <h2 className="font-heading text-xl text-white">Roles and Permissions</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-xs text-slate-200">
            <thead>
              <tr className="text-slate-300">
                <th className="px-3 py-2">Permission</th>
                <th className="px-3 py-2">Super Admin</th>
                <th className="px-3 py-2">Moderator</th>
                <th className="px-3 py-2">Support</th>
              </tr>
            </thead>
            <tbody>
              {permissionsMatrix.map((row) => (
                <tr key={row.permission} className="border-t border-white/10">
                  <td className="px-3 py-2 text-white">{row.permission}</td>
                  <td className="px-3 py-2">{row.super_admin ? "Yes" : "No"}</td>
                  <td className="px-3 py-2">{row.moderator ? "Yes" : "No"}</td>
                  <td className="px-3 py-2">{row.support ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="glass rounded-3xl p-5">
        <h3 className="font-heading text-lg text-white">Admin Accounts</h3>
        {adminUsers.length === 0 ? (
          <p className="surface-soft mt-3 rounded-xl px-3 py-3 text-sm text-slate-300">No admin users in current list.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {adminUsers.map((user) => (
              <article key={user.id} className="surface-soft rounded-xl p-3">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-slate-300">{user.email}</p>
                <p className="mt-1 text-[11px] text-slate-400">Last active: {formatDateTime(user.lastActiveAt)}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminRolesPage;
