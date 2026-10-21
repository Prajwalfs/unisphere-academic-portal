import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { api } from "../api";

const today = () => new Date().toISOString().slice(0, 10);

export default function Enrollments() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [enrollDate, setEnrollDate] = useState(today());
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [studentData, courseData, enrollmentData] = await Promise.all([
        api.list("students"),
        api.list("courses"),
        api.list("enrollments"),
      ]);

      setStudents(studentData);
      setCourses(courseData);
      setEnrollments(enrollmentData);
    } catch (err) {
      setError(err.message || "Unable to load enrollment records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const studentMap = useMemo(
    () => new Map(students.map((student) => [String(student.id), student])),
    [students]
  );

  const courseMap = useMemo(
    () => new Map(courses.map((course) => [String(course.id), course])),
    [courses]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return enrollments.filter((item) => {
      const student = studentMap.get(String(item.studentId));
      const course = courseMap.get(String(item.courseId));

      const matchesSearch = [
        item.id,
        item.studentId,
        item.courseId,
        item.enrollDate,
        student?.name,
        student?.email,
        course?.title,
        course?.instructor,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      );

      const matchesCourse =
        filterCourse === "all" ||
        String(item.courseId) === String(filterCourse);

      return matchesSearch && matchesCourse;
    });
  }, [enrollments, search, filterCourse, studentMap, courseMap]);

  const stats = [
    {
      label: "Total enrollments",
      value: enrollments.length,
      detail: "All enrollment records",
      icon: GraduationCap,
      color: "#635bff",
      background: "#efedff",
    },
    {
      label: "Students enrolled",
      value: new Set(enrollments.map((item) => String(item.studentId))).size,
      detail: "Unique students",
      icon: Users,
      color: "#0d9488",
      background: "#dff8f2",
    },
    {
      label: "Available courses",
      value: courses.length,
      detail: "Courses in the system",
      icon: BookOpen,
      color: "#2563eb",
      background: "#e7f0ff",
    },
    {
      label: "Today's enrollments",
      value: enrollments.filter((item) => item.enrollDate === today()).length,
      detail: "Registered today",
      icon: Activity,
      color: "#d97706",
      background: "#fff3d8",
    },
  ];

  const handleEnroll = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!studentId || !courseId || !enrollDate) {
      setError("Please select a student, course, and enrollment date.");
      return;
    }

    const studentExists = studentMap.has(String(studentId));
    const courseExists = courseMap.has(String(courseId));

    if (!studentExists || !courseExists) {
      setError("The selected student or course no longer exists.");
      return;
    }

    const duplicate = enrollments.some(
      (item) =>
        String(item.studentId) === String(studentId) &&
        String(item.courseId) === String(courseId)
    );

    if (duplicate) {
      setError("This student is already enrolled in the selected course.");
      return;
    }

    if (enrollDate > today()) {
      setError("Enrollment date cannot be in the future.");
      return;
    }

    setSaving(true);

    try {
      await api.create("enrollments", {
        studentId: String(studentId),
        courseId: String(courseId),
        enrollDate,
      });

      setStudentId("");
      setCourseId("");
      setEnrollDate(today());
      setNotice("Student enrolled successfully.");

      await load();
    } catch (err) {
      setError(err.message || "Unable to create enrollment.");
    } finally {
      setSaving(false);
    }
  };

  const cancelEnrollment = async (item) => {
    const student = studentMap.get(String(item.studentId));
    const course = courseMap.get(String(item.courseId));

    if (
      !window.confirm(
        `Cancel enrollment for ${student?.name || "this student"} in ${
          course?.title || "this course"
        }?`
      )
    ) {
      return;
    }

    setDeleting(item.id);
    setError("");
    setNotice("");

    try {
      await api.remove("enrollments", item.id);
      setEnrollments((previous) =>
        previous.filter((enrollment) => enrollment.id !== item.id)
      );
      setNotice("Enrollment cancelled successfully.");
    } catch (err) {
      setError(err.message || "Unable to cancel enrollment.");
    } finally {
      setDeleting(null);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setFilterCourse("all");
  };

  return (
    <div className="sp-page">
      <section className="sp-heading">
        <div>
          <div className="sp-eyebrow">
            <span />
            ACADEMIC MANAGEMENT
          </div>
          <h1>Enrollments</h1>
          <p>Manage student registrations and course assignments.</p>
        </div>

        <button
          type="button"
          className="sp-button sp-button-secondary"
          onClick={load}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "sp-spin" : ""} />
          Refresh
        </button>
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

      <section className="sp-directory">
        <div className="sp-directory-heading">
          <div>
            <h2>Register a student</h2>
            <p>Assign a student to an available course.</p>
          </div>
        </div>

        <form onSubmit={handleEnroll} className="enrollment-form">
          <div className="enrollment-field">
            <label htmlFor="enrollment-student">Student *</label>
            <select
              id="enrollment-student"
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              required
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} — {student.email}
                </option>
              ))}
            </select>
          </div>

          <div className="enrollment-field">
            <label htmlFor="enrollment-course">Course *</label>
            <select
              id="enrollment-course"
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              required
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="enrollment-field">
            <label htmlFor="enrollment-date">Enrollment date *</label>
            <input
              id="enrollment-date"
              type="date"
              value={enrollDate}
              max={today()}
              onChange={(event) => setEnrollDate(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="sp-button sp-button-primary enrollment-submit"
            disabled={saving || loading || !students.length || !courses.length}
          >
            {saving ? (
              <LoaderCircle size={17} className="sp-spin" />
            ) : (
              <Plus size={17} />
            )}
            {saving ? "Enrolling..." : "Enroll student"}
          </button>
        </form>

        {(!students.length || !courses.length) && !loading && (
          <p className="enrollment-hint">
            Add at least one student and one course before creating an
            enrollment.
          </p>
        )}
      </section>

      <section className="sp-directory enrollment-directory">
        <div className="sp-directory-heading">
          <div>
            <h2>Enrollment directory</h2>
            <p>Search registrations and manage course assignments.</p>
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
              placeholder="Search student, course, email, or ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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

          <label className="sp-filter">
            <BookOpen size={17} />
            <select
              value={filterCourse}
              onChange={(event) => setFilterCourse(event.target.value)}
              aria-label="Filter by course"
            >
              <option value="all">All courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>

          {(search || filterCourse !== "all") && (
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
            <strong>Loading enrollments</strong>
            <span>Retrieving student and course registrations...</span>
          </div>
        ) : !filtered.length ? (
          <div className="sp-state">
            <div className="sp-empty-icon">
              <GraduationCap size={28} />
            </div>
            <strong>
              {enrollments.length
                ? "No matching enrollments"
                : "No enrollments yet"}
            </strong>
            <span>
              {enrollments.length
                ? "Try another search or clear your filters."
                : "Register a student using the form above."}
            </span>
            {enrollments.length > 0 && (
              <button
                type="button"
                className="sp-button sp-button-secondary"
                onClick={resetFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="sp-table-wrap">
            <table className="sp-table">
              <thead>
                <tr>
                  <th>ENROLLMENT ID</th>
                  <th>STUDENT</th>
                  <th>COURSE</th>
                  <th>ENROLLMENT DATE</th>
                  <th>STATUS</th>
                  <th className="sp-actions-heading">ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => {
                  const student = studentMap.get(String(item.studentId));
                  const course = courseMap.get(String(item.courseId));

                  return (
                    <tr key={item.id}>
                      <td>
                        <span className="sp-id">#{item.id}</span>
                      </td>

                      <td>
                        <div className="sp-student-cell">
                          <div className="sp-avatar">
                            {(student?.name || "Unknown")
                              .split(/\s+/)
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((part) => part[0].toUpperCase())
                              .join("")}
                          </div>

                          <div className="sp-student-name">
                            <strong>{student?.name || "Unknown student"}</strong>
                            <span>{student?.email || "No email available"}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="sp-student-name">
                          <strong>{course?.title || "Unknown course"}</strong>
                          <span>
                            {course?.instructor || "Instructor not assigned"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="sp-contact">
                          <CalendarDays size={14} />
                          {item.enrollDate || "Not provided"}
                        </div>
                      </td>

                      <td>
                        <span className="sp-status">
                          <span />
                          Active
                        </span>
                      </td>

                      <td>
                        <div className="sp-row-actions">
                          <button
                            type="button"
                            title="Cancel enrollment"
                            aria-label={`Cancel enrollment ${item.id}`}
                            disabled={deleting === item.id}
                            onClick={() => cancelEnrollment(item)}
                          >
                            {deleting === item.id ? (
                              <LoaderCircle size={16} className="sp-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="sp-pagination">
            <span>
              Showing <strong>{filtered.length}</strong> of{" "}
              <strong>{enrollments.length}</strong> enrollments
            </span>
            <span className="enrollment-footer-note">
              <CheckCircle2 size={15} />
              Enrollment records synchronized
            </span>
          </div>
        )}
      </section>
    </div>
  );
}