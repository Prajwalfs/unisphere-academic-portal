import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  RefreshCw,
  Users,
  UserPlus,
  Layers3,
  Search,
  CircleAlert,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { api } from "../api";

const chartColors = [
  "#625bf6",
  "#13b8a6",
  "#f59e0b",
  "#ec4899",
  "#3b82f6",
  "#8b5cf6",
];

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [studentData, courseData, enrollmentData] = await Promise.all([
        api.list("students"),
        api.list("courses"),
        api.list("enrollments"),
      ]);

      if (
        !Array.isArray(studentData) ||
        !Array.isArray(courseData) ||
        !Array.isArray(enrollmentData)
      ) {
        throw new Error("The backend returned an unexpected data format.");
      }

      setStudents(studentData);
      setCourses(courseData);
      setEnrollments(enrollmentData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const departmentData = useMemo(() => {
    const counts = {};

    students.forEach((student) => {
      const department = student.department?.trim() || "Unassigned";
      counts[department] = (counts[department] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [students]);

  const courseData = useMemo(() => {
    return courses
      .map((course) => ({
        name: course.title || "Untitled course",
        students: enrollments.filter(
          (enrollment) =>
            String(enrollment.courseId) === String(course.id)
        ).length,
      }))
      .sort((a, b) => b.students - a.students);
  }, [courses, enrollments]);

  const recentStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...students]
      .filter((student) => {
        const searchable = [
          student.name,
          student.email,
          student.department,
          student.phone,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      })
      .slice(-5)
      .reverse();
  }, [students, search]);

  const stats = [
    {
      label: "Total Students",
      value: students.length,
      description: "Registered student records",
      icon: Users,
      className: "purple",
      trendIcon: ArrowUpRight,
      trend: "Live data",
    },
    {
      label: "Total Courses",
      value: courses.length,
      description: "Available courses",
      icon: BookOpen,
      className: "blue",
      trendIcon: Activity,
      trend: "Live data",
    },
    {
      label: "Enrollments",
      value: enrollments.length,
      description: "Recorded course enrollments",
      icon: GraduationCap,
      className: "green",
      trendIcon: ArrowUpRight,
      trend: "Live data",
    },
    {
      label: "Departments",
      value: departmentData.length,
      description: "Departments represented",
      icon: Layers3,
      className: "orange",
      trendIcon: Activity,
      trend: "Live data",
    },
  ];

  const enrolledStudents = new Set(
    enrollments.map((enrollment) => String(enrollment.studentId))
  ).size;

  const enrollmentRate = students.length
    ? Math.round((enrolledStudents / students.length) * 100)
    : 0;

  const unenrolledStudents = Math.max(
    students.length - enrolledStudents,
    0
  );

  return (
    <div className="dashboard">
      <section className="dashboard-welcome">
        <div className="welcome-copy">
          <div className="welcome-eyebrow">
            <span className="live-dot" />
            UNIVERSITY OVERVIEW
          </div>

          <h1>Welcome to UniSphere</h1>

          <p>
            Your university at a glance. Monitor students, courses, and
            enrollment activity from one workspace.
          </p>

          <div className="welcome-meta">
            <span>
              <CalendarDays size={15} />
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>

            <span>
              <Activity size={15} />
              {loading ? "Refreshing data…" : "Dashboard overview"}
            </span>
          </div>
        </div>

        <div className="welcome-illustration">
          <div className="welcome-orbit orbit-one" />
          <div className="welcome-orbit orbit-two" />
          <div className="welcome-icon">
            <GraduationCap size={58} strokeWidth={1.5} />
          </div>
          <div className="floating-card floating-card-top">
            <Users size={17} />
            <span>{students.length} students</span>
          </div>
          <div className="floating-card floating-card-bottom">
            <BookOpen size={17} />
            <span>{courses.length} courses</span>
          </div>
        </div>
      </section>

      {error && (
        <div className="dashboard-error">
          <CircleAlert size={19} />
          <div>
            <strong>Dashboard data could not be loaded</strong>
            <p>{error}</p>
          </div>
          <button
            className="dashboard-retry"
            onClick={loadDashboard}
            type="button"
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      )}

      <div className="dashboard-section-heading">
        <div>
          <span className="section-kicker">PERFORMANCE</span>
          <h2>University at a glance</h2>
        </div>

        <button
          className="dashboard-refresh"
          onClick={loadDashboard}
          disabled={loading}
          type="button"
        >
          <RefreshCw size={15} className={loading ? "spin-icon" : ""} />
          Refresh data
        </button>
      </div>

      <section className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trendIcon;

          return (
            <article
              className={`stat-card stat-${stat.className}`}
              key={stat.label}
            >
              <div className="stat-card-top">
                <div className={`stat-icon ${stat.className}`}>
                  <Icon size={21} strokeWidth={2} />
                </div>

                <span className="stat-live">
                  <span />
                  Live
                </span>
              </div>

              <p className="stat-label">{stat.label}</p>

              <div className="stat-value-row">
                <h3>{loading ? "—" : stat.value}</h3>
                <span className="stat-trend">
                  <TrendIcon size={14} />
                </span>
              </div>

              <p className="stat-description">{stat.description}</p>

              <div className={`stat-bottom-line ${stat.className}`} />
            </article>
          );
        })}
      </section>

      <section className="dashboard-main-grid">
        <article className="dashboard-panel course-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">ACADEMICS</span>
              <h2>Course engagement</h2>
              <p>Enrollment count for each available course</p>
            </div>

            <div className="panel-heading-icon">
              <BookOpen size={20} />
            </div>
          </div>

          {loading ? (
            <div className="dashboard-loading">Loading course data…</div>
          ) : courseData.length === 0 ? (
            <div className="dashboard-empty">
              <BookOpen size={30} />
              <strong>No courses yet</strong>
              <span>Create a course to see enrollment analytics.</span>
              <Link to="/courses" className="dashboard-inline-link">
                Manage courses <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div className="course-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={courseData}
                  margin={{ top: 12, right: 10, left: -22, bottom: 8 }}
                  barSize={30}
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="#e9edf5"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#79849b", fontSize: 11 }}
                    interval={0}
                    angle={-12}
                    textAnchor="end"
                    height={55}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#79849b", fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f3f4ff" }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e8eaf2",
                      boxShadow: "0 8px 25px rgba(30, 41, 59, 0.08)",
                    }}
                  />
                  <Bar
                    dataKey="students"
                    name="Enrollments"
                    fill="#625bf6"
                    radius={[7, 7, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="panel-footer">
            <span>
              <span className="legend-dot purple-dot" />
              Enrollments per course
            </span>
            <Link to="/courses">
              View courses <ArrowRight size={14} />
            </Link>
          </div>
        </article>

        <article className="dashboard-panel department-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">COMMUNITY</span>
              <h2>Department distribution</h2>
              <p>Students grouped by department</p>
            </div>

            <div className="panel-heading-icon teal">
              <Layers3 size={20} />
            </div>
          </div>

          {loading ? (
            <div className="dashboard-loading">Loading departments…</div>
          ) : departmentData.length === 0 ? (
            <div className="dashboard-empty">
              <Users size={30} />
              <strong>No student records</strong>
              <span>Add students to see department distribution.</span>
            </div>
          ) : (
            <>
              <div className="department-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {departmentData.map((item, index) => (
                        <Cell
                          key={item.name}
                          fill={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        `${value} student${value === 1 ? "" : "s"}`,
                        name,
                      ]}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e8eaf2",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="department-chart-center">
                  <strong>{loading ? "—" : students.length}</strong>
                  <span>Students</span>
                </div>
              </div>

              <div className="department-legend">
                {departmentData.map((department, index) => (
                  <div className="department-legend-row" key={department.name}>
                    <span
                      className="legend-dot"
                      style={{
                        backgroundColor:
                          chartColors[index % chartColors.length],
                      }}
                    />
                    <span className="department-name">{department.name}</span>
                    <strong>{department.value}</strong>
                  </div>
                ))}
              </div>
            </>
          )}
        </article>
      </section>

      <section className="dashboard-bottom-grid">
        <article className="dashboard-panel recent-panel">
          <div className="panel-heading recent-heading">
            <div>
              <span className="section-kicker">STUDENT DIRECTORY</span>
              <h2>Recent students</h2>
              <p>Search and access student records</p>
            </div>

            <Link to="/students" className="dashboard-outline-button">
              View all <ArrowRight size={15} />
            </Link>
          </div>

          <div className="student-search">
            <Search size={17} />
            <input
              type="search"
              placeholder="Search by name, email, department…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="recent-table-wrapper">
            <table className="recent-students-table">
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>DEPARTMENT</th>
                  <th>CONTACT</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="table-message">
                      Loading student records…
                    </td>
                  </tr>
                ) : recentStudents.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="table-message">
                      No students match your search.
                    </td>
                  </tr>
                ) : (
                  recentStudents.map((student, index) => (
                    <tr key={student.id}>
                      <td>
                        <div className="student-identity">
                          <div
                            className={`student-avatar avatar-${index % 5}`}
                          >
                            {initials(student.name)}
                          </div>
                          <div className="student-identity-copy">
                            <strong>{student.name || "Unnamed student"}</strong>
                            <span>{student.email || "No email provided"}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="department-badge">
                          {student.department || "Unassigned"}
                        </span>
                      </td>

                      <td className="student-contact">
                        {student.phone || "—"}
                      </td>

                      <td>
                        <span className="status-badge">
                          <CheckCircle2 size={13} />
                          Registered
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="recent-panel-footer">
            Showing {loading ? "—" : recentStudents.length} of{" "}
            {loading ? "—" : students.length} students
          </div>
        </article>

        <article className="dashboard-panel activity-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">QUICK ACCESS</span>
              <h2>Workspace actions</h2>
              <p>Jump directly into your work</p>
            </div>
          </div>

          <div className="quick-actions-list">
            <Link to="/students/new" className="quick-action">
              <div className="quick-action-icon purple">
                <UserPlus size={20} />
              </div>
              <div className="quick-action-copy">
                <strong>Add student</strong>
                <span>Register a new student</span>
              </div>
              <ArrowRight size={17} />
            </Link>

            <Link to="/courses" className="quick-action">
              <div className="quick-action-icon blue">
                <BookOpen size={20} />
              </div>
              <div className="quick-action-copy">
                <strong>Manage courses</strong>
                <span>Create and update courses</span>
              </div>
              <ArrowRight size={17} />
            </Link>

            <Link to="/enrollments" className="quick-action">
              <div className="quick-action-icon green">
                <GraduationCap size={20} />
              </div>
              <div className="quick-action-copy">
                <strong>Enroll students</strong>
                <span>Manage course enrollment</span>
              </div>
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="enrollment-summary">
            <div className="enrollment-summary-top">
              <div>
                <span>Enrollment coverage</span>
                <strong>{loading ? "—" : `${enrollmentRate}%`}</strong>
              </div>
              <div className="coverage-icon">
                <GraduationCap size={21} />
              </div>
            </div>

            <div
              className="coverage-progress"
              role="progressbar"
              aria-valuenow={loading ? 0 : enrollmentRate}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                style={{
                  width: loading ? "0%" : `${enrollmentRate}%`,
                }}
              />
            </div>

            <div className="coverage-footer">
              <span>{loading ? "—" : enrolledStudents} enrolled</span>
              <span>{loading ? "—" : unenrolledStudents} not enrolled</span>
            </div>
          </div>

          <div className="data-sync-status">
            <div className="sync-status-icon">
              <CheckCircle2 size={17} />
            </div>
            <div>
              <strong>Backend synchronization</strong>
              <span>
                {loading
                  ? "Synchronizing records…"
                  : error
                    ? "Last refresh encountered an error"
                    : "Connected to your API"}
              </span>
              {lastUpdated && !loading && (
                <small>
                  Updated at{" "}
                  {lastUpdated.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </small>
              )}
            </div>
            {!loading && !error && (
              <CheckCircle2 size={17} className="sync-check" />
            )}
          </div>
        </article>
      </section>

      <footer className="dashboard-footer">
        <span>UniSphere Academic Portal</span>
        <span>
          <span className="live-dot" />
          {loading ? "Updating records" : "Data connected"}
        </span>
      </footer>
    </div>
  );
}