import { useState } from "react";
import {
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import StudentProfile from "./pages/StudentProfile.jsx";
import Attendance from "./pages/Attendance.jsx";
import Examinations from "./pages/Examinations.jsx";
import Results from "./pages/Results.jsx";
import Reports from "./pages/Reports.jsx";
import Fees from "./pages/Fees.jsx";
import SettingsPage from "./pages/Settings.jsx";
import {
  Activity,
  ArrowDownLeft,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Command,
  CreditCard,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  ClipboardCheck,
  CalendarDays,
  Award,
  Layers3,
} from "lucide-react";
import Dashboard from "./pages/Dashboard.jsx";
import Students from "./pages/Students.jsx";
import StudentForm from "./pages/StudentForm.jsx";
import Courses from "./pages/Courses.jsx";
import Enrollments from "./pages/Enrollments.jsx";
import "./App.css";

const navigation = [
  {
    label: "WORKSPACE",
    items: [
      {
        label: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "ACADEMIC MANAGEMENT",
    items: [
      {
        label: "Students",
        path: "/students",
        icon: Users,
      },
      {
        label: "Courses",
        path: "/courses",
        icon: BookOpen,
      },
      {
        label: "Enrollments",
        path: "/enrollments",
        icon: GraduationCap,
      },
      {
        label: "Attendance",
        path: "/attendance",
        icon: ClipboardCheck,
      },
      {
        label: "Examinations",
        path: "/examinations",
        icon: CalendarDays,
      },
      {
        label: "Results",
        path: "/results",
        icon: Award,
      },
    ],
  },
  {
    label: "FINANCE & INSIGHTS",
    items: [
      {
        label: "Fees & Payments",
        path: "/fees",
        icon: CreditCard,
      },
      {
        label: "Reports",
        path: "/reports",
        icon: FileBarChart,
      },
    ],
  },
];

const routeInformation = {
  "/": {
    title: "Dashboard",
    description: "Your university overview and analytics",
  },
  "/students": {
    title: "Students",
    description: "Manage student records and profiles",
  },
  "/students/new": {
    title: "Add student",
    description: "Register a student in your university",
  },
  "/courses": {
    title: "Courses",
    description: "Manage courses and instructors",
  },
  "/enrollments": {
    title: "Enrollments",
    description: "Manage student course registrations",
  },
  "/attendance": {
    title: "Attendance",
    description: "Attendance management workspace",
  },
  "/examinations": {
    title: "Examinations",
    description: "Examination scheduling workspace",
  },
  "/results": {
    title: "Results",
    description: "Academic results workspace",
  },
  "/fees": {
    title: "Fees & Payments",
    description: "Student finance management workspace",
  },
  "/reports": {
    title: "Reports",
    description: "University reporting workspace",
  },
  "/settings": {
    title: "Settings",
    description: "Portal preferences and configuration",
  },
};

function ComingSoon({ title, description, icon: Icon }) {
  return (
    <section className="us-module-page">
      <div className="us-module-banner">
        <div className="us-module-icon">
          <Icon size={30} />
        </div>

        <span className="us-module-status">
          <span />
          MODULE PLANNED
        </span>

        <h1>{title}</h1>

        <p>{description}</p>
      </div>

      <div className="us-module-card">
        <div className="us-module-card-icon">
          <Sparkles size={22} />
        </div>

        <div>
          <h2>This module is being prepared</h2>
          <p>
            The workspace is reserved for this feature. The next development
            phase will add the required data model, API operations, and
            management interface.
          </p>
        </div>
      </div>
    </section>
  );
}

function Sidebar({
  collapsed,
  mobileOpen,
  onToggle,
  onNavigate,
}) {
  return (
    <>
      {mobileOpen && (
        <button
          className="us-mobile-overlay"
          onClick={onNavigate}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={[
          "us-sidebar",
          collapsed ? "us-sidebar-collapsed" : "",
          mobileOpen ? "us-sidebar-mobile-open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="us-brand">
          <div className="us-brand-mark">
            <GraduationCap size={25} strokeWidth={2.2} />
          </div>

          {!collapsed && (
            <div className="us-brand-copy">
              <strong>UniSphere</strong>
              <span>ACADEMIC PORTAL</span>
            </div>
          )}

          <button
            className="us-mobile-close"
            onClick={onNavigate}
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        <div className="us-workspace-switcher">
          <div className="us-workspace-avatar">
            <Layers3 size={19} />
          </div>

          {!collapsed && (
            <>
              <div className="us-workspace-copy">
                <strong>University Workspace</strong>
                <span>Administrator access</span>
              </div>

              <ChevronDown size={15} />
            </>
          )}
        </div>

        <nav className="us-navigation">
          {navigation.map((group) => (
            <div className="us-nav-group" key={group.label}>
              {!collapsed && (
                <div className="us-nav-heading">{group.label}</div>
              )}

              {group.items.map((item) => {
                const Icon = item.icon;

                if (item.upcoming) {
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      title={collapsed ? item.label : undefined}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `us-nav-link ${isActive ? "active" : ""}`
                      }
                    >
                      <Icon size={19} strokeWidth={1.8} />

                      {!collapsed && (
                        <>
                          <span className="us-nav-label">{item.label}</span>
                          <span className="us-nav-upcoming">SOON</span>
                        </>
                      )}
                    </NavLink>
                  );
                }

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    title={collapsed ? item.label : undefined}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `us-nav-link ${isActive ? "active" : ""}`
                    }
                  >
                    <Icon size={19} strokeWidth={1.8} />

                    {!collapsed && (
                      <span className="us-nav-label">{item.label}</span>
                    )}

                    {!collapsed && item.path === "/" && (
                      <span className="us-nav-active-dot" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="us-sidebar-bottom">
          {!collapsed && (
            <div className="us-help-card">
              <div className="us-help-icon">
                <CircleHelp size={19} />
              </div>

              <strong>Need assistance?</strong>

              <p>Manage your workspace with confidence.</p>

              <button
                type="button"
                onClick={() =>
                  window.open(
                    "https://react.dev/learn",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                Help center <ArrowDownLeft size={14} />
              </button>
            </div>
          )}

          <NavLink
            to="/settings"
            title={collapsed ? "Settings" : undefined}
            onClick={onNavigate}
            className={({ isActive }) =>
              `us-nav-link us-settings-link ${isActive ? "active" : ""}`
            }
          >
            <Settings size={19} strokeWidth={1.8} />
            {!collapsed && <span className="us-nav-label">Settings</span>}
          </NavLink>

          <div className="us-sidebar-footer">
            <span className="us-footer-status" />
            {!collapsed && (
              <span>UniSphere Portal · v2.0</span>
            )}
          </div>
        </div>

        <button
          className="us-collapse-button"
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight size={17} />
          ) : (
            <ChevronLeft size={17} />
          )}
        </button>
      </aside>
    </>
  );
}

function Topbar({ onMenu, title, description }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();

    if (!searchValue.trim()) return;

    navigate(`/students?search=${encodeURIComponent(searchValue.trim())}`);
    setSearchOpen(false);
  };

  return (
    <header className="us-topbar">
      <div className="us-topbar-left">
        <button
          className="us-icon-button us-mobile-menu"
          onClick={onMenu}
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>

        <div className="us-breadcrumb">
          <span>Workspace</span>
          <ChevronRight size={14} />
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
      </div>

      <div className="us-topbar-actions">
        <div className="us-date-pill">
          <CalendarDays size={15} />
          <span>
            {new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        <button
          className="us-icon-button"
          onClick={() => setSearchOpen((value) => !value)}
          aria-label="Search students"
          title="Search students"
        >
          <Search size={19} />
        </button>

        <div className="us-popover-anchor">
          <button
            className={`us-icon-button us-notification-button ${
              notificationsOpen ? "selected" : ""
            }`}
            onClick={() => {
              setNotificationsOpen((value) => !value);
              setProfileOpen(false);
            }}
            aria-label="Notifications"
          >
            <Bell size={19} />
            <span className="us-notification-dot" />
          </button>

          {notificationsOpen && (
            <div className="us-popover us-notification-popover">
              <div className="us-popover-heading">
                <strong>Notifications</strong>
                <span>Workspace</span>
              </div>

              <div className="us-notification-item">
                <div className="us-notification-icon">
                  <Activity size={17} />
                </div>

                <div>
                  <strong>Dashboard is ready</strong>
                  <p>Your university overview is available.</p>
                </div>
              </div>

              <div className="us-notification-item">
                <div className="us-notification-icon teal">
                  <ShieldCheck size={17} />
                </div>

                <div>
                  <strong>API workspace</strong>
                  <p>Refresh your dashboard to reload live records.</p>
                </div>
              </div>

              <div className="us-popover-footer">
                No additional notifications
              </div>
            </div>
          )}
        </div>

        <div className="us-profile-anchor">
          <button
            className="us-profile-button"
            onClick={() => {
              setProfileOpen((value) => !value);
              setNotificationsOpen(false);
            }}
          >
            <div className="us-profile-avatar">AD</div>

            <div className="us-profile-copy">
              <strong>Administrator</strong>
              <span>System Admin</span>
            </div>

            <ChevronDown size={15} />
          </button>

          {profileOpen && (
            <div className="us-popover us-profile-popover">
              <div className="us-profile-popover-heading">
                <div className="us-profile-avatar large">AD</div>
                <div>
                  <strong>Administrator</strong>
                  <span>System Admin</span>
                </div>
              </div>

              <button
                className="us-profile-menu-item"
                onClick={() => {
                  navigate("/settings");
                  setProfileOpen(false);
                }}
              >
                <Settings size={17} />
                Portal settings
              </button>

              <div className="us-profile-menu-note">
                <ShieldCheck size={16} />
                Local development workspace
              </div>
            </div>
          )}
        </div>
      </div>

      {searchOpen && (
        <form className="us-global-search" onSubmit={handleSearch}>
          <Search size={18} />

          <input
            autoFocus
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search students by name, email or department…"
            aria-label="Search students"
          />

          <button type="submit">Search students</button>

          <button
            type="button"
            className="us-search-close"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
          >
            <X size={17} />
          </button>
        </form>
      )}
    </header>
  );
}

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();

  const currentRoute =
    routeInformation[location.pathname] || {
      title: "UniSphere",
      description: "University management workspace",
    };

  const closeMobileSidebar = () => setMobileOpen(false);

  return (
    <div className="us-shell">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed((value) => !value)}
        onNavigate={closeMobileSidebar}
      />

      <div
        className={`us-main ${
          collapsed ? "us-main-collapsed" : ""
        }`}
      >
        <Topbar
          onMenu={() => setMobileOpen(true)}
          title={currentRoute.title}
          description={currentRoute.description}
        />

        <main className="us-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/:id" element={<StudentProfile />} />
            <Route path="/students/new" element={<StudentForm />} />
            <Route path="/students/:id/edit" element={<StudentForm />} />
            <Route path="/students/edit/:id" element={<StudentForm />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/enrollments" element={<Enrollments />} />

           <Route path="/examinations" element={<Examinations />} />
           <Route path="/results" element={<Results />} />

            <Route
              path="/results"
              element={
                <ComingSoon
                  title="Academic Results"
                  description="Manage marks, grades, and academic performance."
                  icon={Award}
                />
              }
            />

            <Route path="/fees" element={<Fees />} />

            <Route path="/reports" element={<Reports />} />

            <Route path="/settings" element={<SettingsPage />} />

            <Route
              path="*"
              element={
                <ComingSoon
                  title="Page not found"
                  description="The requested workspace could not be found."
                  icon={CircleHelp}
                />
              }
            />
          </Routes>

          <footer className="us-global-footer">
            <span>© {new Date().getFullYear()} UniSphere Academic Portal</span>
            <span>
              <span className="us-footer-status" />
              Student Management System
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}

