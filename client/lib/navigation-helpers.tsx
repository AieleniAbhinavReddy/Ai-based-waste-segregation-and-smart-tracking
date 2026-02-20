/**
 * Navigation Updates for Admin & Supervisor Features
 * 
 * Add these navigation items to your DashboardLayout or Sidebar component
 * to make admin and supervisor features easily accessible
 */

// Navigation menu items to add to your sidebar:

const adminNavigationItems = [
  {
    label: 'Admin Panel',
    icon: 'Settings', // or appropriate icon component
    children: [
      {
        label: 'Dashboard',
        path: '/admin/dashboard',
        icon: 'BarChart3',
      },
      {
        label: 'User Management',
        path: '/admin/users',
        icon: 'Users',
      },
      {
        label: 'Zone Management',
        path: '/admin/zones',
        icon: 'MapPin',
      },
      {
        label: 'Pickup Monitoring',
        path: '/admin/pickups',
        icon: 'Eye',
      },
      {
        label: 'Complaint Management',
        path: '/admin/complaints',
        icon: 'MessageSquare',
      },
    ],
  },
];

const supervisorNavigationItems = [
  {
    label: 'My Zone',
    icon: 'MapPin', // or appropriate icon component
    children: [
      {
        label: 'Dashboard',
        path: '/supervisor/dashboard',
        icon: 'BarChart3',
      },
      {
        label: 'Worker Monitoring',
        path: '/supervisor/workers',
        icon: 'Truck',
      },
      {
        label: 'Pickup Verification',
        path: '/supervisor/pickups',
        icon: 'Eye',
      },
      {
        label: 'Complaints',
        path: '/supervisor/complaints',
        icon: 'AlertTriangle',
      },
      {
        label: 'Performance',
        path: '/supervisor/performance',
        icon: 'TrendingUp',
      },
    ],
  },
];

// ============================================================
// Example: Adding to DashboardLayout.tsx
// ============================================================

/*

import { useAuth as useSupabaseAuth } from "@/lib/supabase";
import { checkAdminAccess, checkSupervisorAccess } from "@/lib/admin-operations";
import { useEffect, useState } from "react";

const DashboardLayout = ({ children }) => {
  const { user } = useSupabaseAuth();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      getAndSetUserRole();
    }
  }, [user]);

  const getAndSetUserRole = async () => {
    if (!user) return;
    
    const isAdmin = await checkAdminAccess(user.id);
    if (isAdmin) {
      setUserRole('admin');
      return;
    }
    
    const isSupervisor = await checkSupervisorAccess(user.id);
    if (isSupervisor) {
      setUserRole('supervisor');
    }
  };

  const getNavigationItems = () => {
    const baseItems = [
      // ... existing navigation items ...
      { label: 'Dashboard', path: '/dashboard', icon: 'Home' },
      { label: 'Classify Waste', path: '/classify', icon: 'Camera' },
      // ... more items ...
    ];

    if (userRole === 'admin') {
      return [
        ...baseItems,
        { label: 'Divider', isDivider: true },
        ...adminNavigationItems,
      ];
    }

    if (userRole === 'supervisor') {
      return [
        ...baseItems,
        { label: 'Divider', isDivider: true },
        ...supervisorNavigationItems,
      ];
    }

    return baseItems;
  };

  return (
    <div className="flex">
      <Sidebar items={getNavigationItems()} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

*/

// ============================================================
// Navigation Guard Component
// ============================================================

import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth as useSupabaseAuth } from '@/lib/supabase';
import { checkAdminAccess, checkSupervisorAccess } from '@/lib/admin-operations';

/**
 * Protect admin routes from non-admin users
 */
export const withAdminCheck = (Component: React.ComponentType<any>) => {
  return (props: any) => {
    const { user, loading } = useSupabaseAuth();
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [checking, setChecking] = React.useState(true);

    useEffect(() => {
      if (!loading && user) {
        checkAdminAccess(user.id).then((hasAccess) => {
          if (!hasAccess) {
            navigate('/dashboard');
          } else {
            setIsAdmin(true);
          }
          setChecking(false);
        });
      } else if (!loading && !user) {
        navigate('/login');
      }
    }, [user, loading, navigate]);

    if (loading || checking) {
      return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!isAdmin) {
      return null;
    }

    return <Component {...props} />;
  };
};

/**
 * Protect supervisor routes from non-supervisor users
 */
export const withSupervisorCheck = (Component: React.ComponentType<any>) => {
  return (props: any) => {
    const { user, loading } = useSupabaseAuth();
    const navigate = useNavigate();
    const [isSupervisor, setIsSupervisor] = React.useState(false);
    const [checking, setChecking] = React.useState(true);

    useEffect(() => {
      if (!loading && user) {
        checkSupervisorAccess(user.id).then((hasAccess) => {
          if (!hasAccess) {
            navigate('/dashboard');
          } else {
            setIsSupervisor(true);
          }
          setChecking(false);
        });
      } else if (!loading && !user) {
        navigate('/login');
      }
    }, [user, loading, navigate]);

    if (loading || checking) {
      return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!isSupervisor) {
      return null;
    }

    return <Component {...props} />;
  };
};

// ============================================================
// Role Badge Component
// ============================================================

/**
 * Display user's role as a badge
 */
export const UserRoleBadge = ({ userId }: { userId: string }) => {
  const [role, setRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const getRole = async () => {
      const isAdmin = await checkAdminAccess(userId);
      if (isAdmin) {
        setRole('admin');
        return;
      }

      const isSupervisor = await checkSupervisorAccess(userId);
      if (isSupervisor) {
        setRole('supervisor');
        return;
      }

      setRole('citizen');
    };

    getRole();
  }, [userId]);

  if (!role) return null;

  const colors = {
    admin: 'bg-red-100 text-red-800',
    supervisor: 'bg-blue-100 text-blue-800',
    citizen: 'bg-green-100 text-green-800',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[role as keyof typeof colors]}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
};

// ============================================================
// Quick Links Component
// ============================================================

/**
 * Display role-specific quick links
 */
export const RoleQuickLinks = ({ userId }: { userId: string }) => {
  const [links, setLinks] = React.useState<Array<{ label: string; path: string }>>([]);

  React.useEffect(() => {
    const getLinks = async () => {
      const isAdmin = await checkAdminAccess(userId);
      if (isAdmin) {
        setLinks([
          { label: 'Admin Dashboard', path: '/admin/dashboard' },
          { label: 'Users', path: '/admin/users' },
          { label: 'Zones', path: '/admin/zones' },
          { label: 'Pickups', path: '/admin/pickups' },
          { label: 'Complaints', path: '/admin/complaints' },
        ]);
        return;
      }

      const isSupervisor = await checkSupervisorAccess(userId);
      if (isSupervisor) {
        setLinks([
          { label: 'Zone Dashboard', path: '/supervisor/dashboard' },
          { label: 'Workers', path: '/supervisor/workers' },
          { label: 'Pickups', path: '/supervisor/pickups' },
          { label: 'Complaints', path: '/supervisor/complaints' },
        ]);
        return;
      }

      setLinks([
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Classify Waste', path: '/classify' },
        { label: 'Rewards', path: '/rewards' },
      ]);
    };

    getLinks();
  }, [userId]);

  return (
    <div className="space-y-2">
      {links.map((link) => (
        <a
          key={link.path}
          href={link.path}
          className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
};

// ============================================================
// Export for use in other components
// ============================================================

export default {
  adminNavigationItems,
  supervisorNavigationItems,
  withAdminCheck,
  withSupervisorCheck,
  UserRoleBadge,
  RoleQuickLinks,
};
