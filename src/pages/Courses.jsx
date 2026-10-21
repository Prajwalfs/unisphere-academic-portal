import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { api } from "../api";

const emptyForm = {
  title: "",
  duration: "",
  instructor: "",
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.list("courses");
      setCourses(data);
    } catch (err) {
      setError(err.message || "Unable to load courses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return courses
      .filter((course) =>
        [course.id, course.title, course.duration, course.instructor].some(
          (value) => String(value ?? "").toLowerCase().includes(query)
        )
      )
      .sort((a, b) => {
        const first = String(a[sortField] ?? "");
        const second = String(b[sortField] ?? "");

        const comparison = first.localeCompare(second, undefined, {
          numeric: true,
          sensitivity: "base",
        });

        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [courses, search, sortField, sortDirection]);

  const stats = [
    {
      label: "Total courses",
      value: courses.length,
      detail: "All registered courses",
      icon: BookOpen,
      color: "#635bff",
      background: "#efedff",
    },
    {
      label: "Instructors",
      value: new Set(
        courses
          .map((course) => course.instructor?.trim().toLowerCase())
          .filter(Boolean)
      ).size,
      detail: "Unique instructors",
      icon: Users,
      color: "#0d9488",
      background: "#dff8f2",
    },
    {
      label: "Course durations",
      value: new Set(courses.map((course) => course.duration).filter(Boolean))
        .size,
      detail: "Different durations",
      icon: Clock,
      color: "#2563eb",
      background: "#e7f0ff",
    },
    {
      label: "Matching courses",
      value: filtered.length,
      detail: "Based on your search",
      icon: Activity,
      color: "#d97706",
      background: "#fff3d8",
    },
  ];

  const changeSort = (field) => {
    if (sortField === field) {
      setSortDirection((value) => (value === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setError("");
    setFormOpen(false);
  };

  const startEdit = (course) => {
    setForm({
      title: course.title || "",
      duration: course.duration || "",
      instructor: course.instructor || "",
    });
    setEditId(course.id);
    setError("");
    setNotice("");
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const data = {
      title: form.title.trim(),
      duration: form.duration.trim(),
      instructor: form.instructor.trim(),
    };

    if (!data.title || !data.duration || !data.instructor) {
      setError("Please complete all course fields.");
      return;
    }

    const duplicate = courses.some(
      (course) =>
        course.id !== editId &&
        course.title.trim().toLowerCase() === data.title.toLowerCase()
    );

    if (duplicate) {
      setError("A course with this title already exists.");
      return;
    }

    setSaving(true);

    try {
      if (editId) {
        await api.update("courses", editId, data);
        setNotice("Course updated successfully.");
      } else {
        await api.create("courses", data);
        setNotice("Course added successfully.");
      }

      setForm(emptyForm);
      setEditId(null);
      setFormOpen(false);
      await load();
    } catch (err) {
      setError(err.message || "Unable to save course details.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (course) => {
    if (
      !window.confirm(
        `Delete "${course.title}"? Existing enrollments referencing this course may be affected.`
      )
    ) {
      return;
    }

    setDeleting(course.id);
    setError("");
    setNotice("");

    try {
      await api.remove("courses", course.id);
      setCourses((previous) =>
        previous.filter((item) => item.id !== course.id)
      );
      setNotice(`"${course.title}" was deleted successfully.`);

      if (editId === course.id) {
        resetForm();
      }
    } catch (err) {
      setError(err.message || "Unable to delete this course.");
    } finally {
      setDeleting(null);
    }
  };

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
          <h1>Courses</h1>
          <p>Manage courses, instructors, and academic durations.</p>
        </div>

        <div className="sp-heading-actions">
          <button
            type="button"
            className="sp-button sp-button-secondary"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "sp-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            className="sp-button sp-button-primary"
            onClick={() => {
              if (formOpen && !editId) {
                resetForm();
              } else {
                setForm(emptyForm);
                setEditId(null);
                setError("");
                setNotice("");
                setFormOpen(true);
              }
            }}
          >
            {formOpen && !editId ? <X size={17} /> : <Plus size={17} />}
            {formOpen && !editId ? "Close form" : "Add course"}
          </button>
        </div>
      </section>

      {error && (
        <div className="sp-alert sp-alert-error" role="alert">
          {error}
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {notice && (
        <div className="sp-alert sp-alert-success" role="status">
          {notice}
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <section className="sp-stats">
        {stats.map((stat) => {
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

      {formOpen && (
        <section className="sp-directory course-form-section">
          <div className="sp-directory-heading">
            <div>
              <h2>{editId ? "Edit course" : "Create a course"}</h2>
              <p>
                {editId
                  ? "Update the selected course details."
                  : "Add a new course to your university catalog."}
              </p>
            </div>
          </div>

          <form className="course-form" onSubmit={submit}>
            <div className="course-field">
              <label htmlFor="course-title">Course title *</label>
              <input
                id="course-title"
                name="title"
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                placeholder="e.g. Data Structures"
                maxLength={120}
                required
              />
            </div>

            <div className="course-field">
              <label htmlFor="course-duration">Duration *</label>
              <input
                id="course-duration"
                name="duration"
                value={form.duration}
                onChange={(event) =>
                  setForm({ ...form, duration: event.target.value })
                }
                placeholder="e.g. 4 months"
                maxLength={60}
                required
              />
            </div>

            <div className="course-field">
              <label htmlFor="course-instructor">Instructor *</label>
              <input
                id="course-instructor"
                name="instructor"
                value={form.instructor}
                onChange={(event) =>
                  setForm({ ...form, instructor: event.target.value })
                }
                placeholder="e.g. Prof. Iyer"
                maxLength={100}
                required
              />
            </div>

            <div className="course-form-actions">
              <button
                type="button"
                className="sp-button sp-button-secondary"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="sp-button sp-button-primary"
                disabled={saving}
              >
                {saving ? (
                  <LoaderCircle size={17} className="sp-spin" />
                ) : editId ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <Plus size={17} />
                )}
                {saving ? "Saving..." : editId ? "Update course" : "Save course"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="sp-directory course-directory">
        <div className="sp-directory-heading">
          <div>
            <h2>Course directory</h2>
            <p>Search, sort, and manage your academic catalog.</p>
          </div>

          <span className="sp-record-count">
            {filtered.length} {filtered.length === 1 ? "course" : "courses"}
          </span>
        </div>

        <div className="sp-toolbar">
          <label className="sp-search">
            <Search size={18} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, duration, instructor, or ID..."
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </label>

          {search && (
            <button
              type="button"
              className="sp-reset"
              onClick={() => setSearch("")}
            >
              Clear search
            </button>
          )}
        </div>

        {loading ? (
          <div className="sp-state">
            <RefreshCw size={25} className="sp-spin" />
            <strong>Loading courses</strong>
            <span>Retrieving your academic catalog...</span>
          </div>
        ) : !filtered.length ? (
          <div className="sp-state">
            <div className="sp-empty-icon">
              <BookOpen size={28} />
            </div>

            <strong>
              {courses.length ? "No matching courses" : "No courses yet"}
            </strong>

            <span>
              {courses.length
                ? "Try another search term."
                : "Add your first course to populate the catalog."}
            </span>

            {!courses.length && (
              <button
                type="button"
                className="sp-button sp-button-primary"
                onClick={() => setFormOpen(true)}
              >
                <Plus size={16} />
                Add course
              </button>
            )}
          </div>
        ) : (
          <div className="sp-table-wrap">
            <table className="sp-table">
              <thead>
                <tr>
                  <th>
                    <button
                      type="button"
                      className="course-sort-button"
                      onClick={() => changeSort("id")}
                    >
                      COURSE ID {sortIcon("id")}
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      className="course-sort-button"
                      onClick={() => changeSort("title")}
                    >
                      COURSE {sortIcon("title")}
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      className="course-sort-button"
                      onClick={() => changeSort("duration")}
                    >
                      DURATION {sortIcon("duration")}
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      className="course-sort-button"
                      onClick={() => changeSort("instructor")}
                    >
                      INSTRUCTOR {sortIcon("instructor")}
                    </button>
                  </th>
                  <th>STATUS</th>
                  <th className="sp-actions-heading">ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((course, index) => (
                  <tr key={course.id}>
                    <td>
                      <span className="sp-id">#{course.id}</span>
                    </td>

                    <td>
                      <div className="sp-student-cell">
                        <div
                          className="sp-avatar"
                          style={{
                            background: [
                              "#efedff",
                              "#dff8f2",
                              "#e7f0ff",
                              "#fff3d8",
                            ][index % 4],
                            color: [
                              "#635bff",
                              "#0d9488",
                              "#2563eb",
                              "#d97706",
                            ][index % 4],
                          }}
                        >
                          <BookOpen size={18} />
                        </div>

                        <div className="sp-student-name">
                          <strong>{course.title}</strong>
                          <span>Academic course</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="sp-contact">
                        <Clock size={15} />
                        {course.duration || "Not specified"}
                      </div>
                    </td>

                    <td>
                      <div className="sp-student-name">
                        <strong>{course.instructor || "Unassigned"}</strong>
                        <span>Course instructor</span>
                      </div>
                    </td>

                    <td>
                      <span className="sp-status">
                        <span />
                        Available
                      </span>
                    </td>

                    <td>
                      <div className="sp-row-actions">
                        <button
                          type="button"
                          title="Edit course"
                          aria-label={`Edit ${course.title}`}
                          onClick={() => startEdit(course)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          title="Delete course"
                          aria-label={`Delete ${course.title}`}
                          disabled={deleting === course.id}
                          onClick={() => remove(course)}
                        >
                          {deleting === course.id ? (
                            <LoaderCircle size={16} className="sp-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="sp-pagination">
            <span>
              Showing <strong>{filtered.length}</strong> of{" "}
              <strong>{courses.length}</strong> courses
            </span>

            <span className="enrollment-footer-note">
              <CheckCircle2 size={15} />
              Course catalog synchronized
            </span>
          </div>
        )}
      </section>
    </div>
  );
}