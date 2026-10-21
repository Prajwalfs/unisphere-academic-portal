import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Building2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Mail,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { api } from "../api";

const PAGE_SIZE = 8;

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "?";

const avatarColors = [
  "#ede9fe",
  "#dbeafe",
  "#d1fae5",
  "#ffedd5",
  "#fce7f3",
];

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleting, setDeleting] = useState(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await api.list("students");

      if (!Array.isArray(result)) {
        throw new Error("The server returned an unexpected response.");
      }

      setStudents(result);
    } catch (err) {
      setError(
        err.message || "Unable to load students. Check your backend connection."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const departments = useMemo(
    () =>
      [...new Set(students.map((s) => s.department?.trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b)),
    [students]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students
      .filter((student) => {
        const matchesSearch = [
          student.id,
          student.name,
          student.email,
          student.phone,
          student.department,
        ].some((value) => String(value ?? "").toLowerCase().includes(query));

        const matchesDepartment =
          department === "all" || student.department === department;

        return matchesSearch && matchesDepartment;
      })
      .sort((a, b) => {
        const first = String(a[sortField] ?? "");
        const second = String(b[sortField] ?? "");

        const comparison =
          sortField === "id" &&
          Number.isFinite(Number(first)) &&
          Number.isFinite(Number(second))
            ? Number(first) - Number(second)
            : first.localeCompare(second, undefined, {
                numeric: true,
                sensitivity: "base",
              });

        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [students, search, department, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleStudents = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const resetFilters = () => {
    setSearch("");
    setDepartment("all");
    setPage(1);
  };

  const changeSort = (field) => {
    if (sortField === field) {
      setSortDirection((value) => (value === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }

    setPage(1);
  };

  const deleteStudent = async (student) => {
    if (
      !window.confirm(
        `Delete ${student.name}'s record? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeleting(student.id);
    setNotice("");
    setError("");

    try {
      await api.remove("students", student.id);
      setStudents((previous) =>
        previous.filter((item) => item.id !== student.id)
      );
      setNotice(`${student.name}'s record was deleted successfully.`);
    } catch {
      setError("Unable to delete this student. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const exportCsv = () => {
    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = [
      ["ID", "Name", "Email", "Phone", "Department"],
      ...filtered.map((student) => [
        student.id,
        student.name,
        student.email,
        student.phone,
        student.department,
      ]),
    ];

    const csv = "\uFEFF" + rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "unisphere-students.csv";
    anchor.click();

    URL.revokeObjectURL(url);
  };

  const statCards = [
    {
      label: "Total students",
      value: students.length,
      detail: "All registered records",
      icon: Users,
      color: "#635bff",
      background: "#efedff",
    },
    {
      label: "Departments",
      value: departments.length,
      detail: "Departments represented",
      icon: Building2,
      color: "#0d9488",
      background: "#dff8f2",
    },
    {
      label: "Filtered results",
      value: filtered.length,
      detail: "Matching your filters",
      icon: Activity,
      color: "#2563eb",
      background: "#e7f0ff",
    },
  ];

  const sortIcon = (field) => {
    if (sortField !== field) return <ArrowUpDown size={14} />;
    return sortDirection === "asc" ? (
      <ArrowUp size={14} />
    ) : (
      <ArrowDown size={14} />
    );
  };

  return (
    <div className="sp-page">
      <section className="sp-heading">
        <div>
          <div className="sp-eyebrow">
            <span />
            ACADEMIC MANAGEMENT
          </div>
          <h1>Students</h1>
          <p>Manage student records, contact details, and departments.</p>
        </div>

        <div className="sp-heading-actions">
          <button
            type="button"
            className="sp-button sp-button-secondary"
            onClick={loadStudents}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "sp-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            className="sp-button sp-button-secondary"
            onClick={exportCsv}
            disabled={!filtered.length}
          >
            <Download size={16} />
            Export CSV
          </button>

          <Link to="/students/new" className="sp-button sp-button-primary">
            <Plus size={17} />
            Add student
          </Link>
        </div>
      </section>

      {error && (
        <div className="sp-alert sp-alert-error" role="alert">
          {error}
          <button type="button" onClick={() => setError("")} aria-label="Dismiss">
            <X size={17} />
          </button>
        </div>
      )}

      {notice && (
        <div className="sp-alert sp-alert-success" role="status">
          {notice}
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss">
            <X size={17} />
          </button>
        </div>
      )}

      <section className="sp-stats">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <article className="sp-stat-card" key={stat.label}>
              <div
                className="sp-stat-icon"
                style={{
                  color: stat.color,
                  background: stat.background,
                }}
              >
                <Icon size={21} />
              </div>
              <div className="sp-stat-copy">
                <span>{stat.label}</span>
                <strong>{loading ? "—" : stat.value}</strong>
                <small>{stat.detail}</small>
              </div>
            </article>
          );
        })}
      </section>

      <section className="sp-directory">
        <div className="sp-directory-heading">
          <div>
            <h2>Student directory</h2>
            <p>Search, filter, and manage your university community.</p>
          </div>

          <span className="sp-record-count">
            {filtered.length} {filtered.length === 1 ? "record" : "records"}
          </span>
        </div>

        <div className="sp-toolbar">
          <label className="sp-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search name, email, phone, or ID..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </label>

          <label className="sp-filter">
            <SlidersHorizontal size={17} />
            <select
              value={department}
              onChange={(event) => {
                setDepartment(event.target.value);
                setPage(1);
              }}
              aria-label="Filter by department"
            >
              <option value="all">All departments</option>
              {departments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          {(search || department !== "all") && (
            <button
              type="button"
              className="sp-reset"
              onClick={resetFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="sp-state">
            <RefreshCw size={25} className="sp-spin" />
            <strong>Loading student records</strong>
            <span>Connecting to your university database...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="sp-state">
            <div className="sp-empty-icon">
              <Users size={28} />
            </div>
            <strong>{students.length ? "No matching students" : "No students yet"}</strong>
            <span>
              {students.length
                ? "Try another search or clear your filters."
                : "Register your first student to populate this directory."}
            </span>
            {students.length ? (
              <button
                type="button"
                className="sp-button sp-button-secondary"
                onClick={resetFilters}
              >
                Clear filters
              </button>
            ) : (
              <Link to="/students/new" className="sp-button sp-button-primary">
                <Plus size={16} />
                Add student
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="sp-table-wrap">
              <table className="sp-table">
                <thead>
                  <tr>
                    <th>
                      <button type="button" onClick={() => changeSort("name")}>
                        STUDENT {sortIcon("name")}
                      </button>
                    </th>
                    <th>
                      <button type="button" onClick={() => changeSort("id")}>
                        STUDENT ID {sortIcon("id")}
                      </button>
                    </th>
                    <th>
                      <button
                        type="button"
                        onClick={() => changeSort("department")}
                      >
                        DEPARTMENT {sortIcon("department")}
                      </button>
                    </th>
                    <th>CONTACT INFORMATION</th>
                    <th>STATUS</th>
                    <th className="sp-actions-heading">ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleStudents.map((student, index) => (
                    <tr key={student.id}>
                      <td>
                        <div className="sp-student-cell">
                          <div
                            className="sp-avatar"
                            style={{
                              background:
                                avatarColors[index % avatarColors.length],
                            }}
                          >
                            {initials(student.name)}
                          </div>
                          <div className="sp-student-name">
                            <strong>{student.name || "Unnamed student"}</strong>
                            <span>
                              <Mail size={13} />
                              {student.email || "No email provided"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="sp-id">#{student.id}</span>
                      </td>

                      <td>
                        <span className="sp-department">
                          {student.department || "Unassigned"}
                        </span>
                      </td>

                      <td>
                        <div className="sp-contact">
                          <Phone size={14} />
                          {student.phone || "Not provided"}
                        </div>
                      </td>

                      <td>
                        <span className="sp-status">
                          <span />
                          Registered
                        </span>
                      </td>

                      <td>
                        <div className="sp-row-actions">
                          <Link
                            to={`/students/${student.id}/edit`}
                            title="View or edit student"
                            aria-label={`Edit ${student.name}`}
                          >
                            <Eye size={16} />
                          </Link>

                          <Link
                            to={`/students/${student.id}/edit`}
                            title="Edit student"
                            aria-label={`Edit ${student.name}`}
                          >
                            <Pencil size={16} />
                          </Link>

                          <button
                            type="button"
                            title="Delete student"
                            aria-label={`Delete ${student.name}`}
                            disabled={deleting === student.id}
                            onClick={() => deleteStudent(student)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sp-pagination">
              <span>
                Showing{" "}
                <strong>{(currentPage - 1) * PAGE_SIZE + 1}</strong>–
                <strong>
                  {Math.min(currentPage * PAGE_SIZE, filtered.length)}
                </strong>{" "}
                of <strong>{filtered.length}</strong> students
              </span>

              <div className="sp-page-controls">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={currentPage === 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  <ChevronLeft size={17} />
                </button>

                <span>
                  Page <strong>{currentPage}</strong> of{" "}
                  <strong>{totalPages}</strong>
                </span>

                <button
                  type="button"
                  aria-label="Next page"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setPage((value) => Math.min(totalPages, value + 1))
                  }
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}