import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Download,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { api } from "../api";

const today = () => new Date().toLocaleDateString("en-CA");

const emptyForm = {
  studentId: "",
  courseId: "",
  date: today(),
  status: "Present",
};

const statuses = ["Present", "Absent", "Late", "Excused"];

const statusColors = {
  Present: "at-status-present",
  Absent: "at-status-absent",
  Late: "at-status-late",
  Excused: "at-status-excused",
};

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(today());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [studentData, courseData, attendanceData] = await Promise.all([
        api.list("students"),
        api.list("courses"),
        api.list("attendance"),
      ]);

      setStudents(Array.isArray(studentData) ? studentData : []);
      setCourses(Array.isArray(courseData) ? courseData : []);
      setRecords(Array.isArray(attendanceData) ? attendanceData : []);
    } catch (err) {
      setError(err.message || "Unable to load attendance records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const studentName = (id) =>
    students.find((student) => String(student.id) === String(id))?.name ??
    "Unknown student";

  const studentEmail = (id) =>
    students.find((student) => String(student.id) === String(id))?.email ??
    "";

  const courseName = (id) =>
    courses.find((course) => String(course.id) === String(id))?.title ??
    "Unknown course";

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records
      .filter((record) => {
        const matchesSearch = [
          studentName(record.studentId),
          studentEmail(record.studentId),
          courseName(record.courseId),
          record.status,
          record.date,
        ].some((value) => String(value ?? "").toLowerCase().includes(query));

        const matchesCourse =
          courseFilter === "all" ||
          String(record.courseId) === String(courseFilter);

        const matchesDate = !dateFilter || record.date === dateFilter;

        return matchesSearch && matchesCourse && matchesDate;
      })
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [records, search, courseFilter, dateFilter, students, courses]);

  const todayRecords = records.filter((record) => record.date === today());

  const presentToday = todayRecords.filter(
    (record) => record.status === "Present"
  ).length;

  const absentToday = todayRecords.filter(
    (record) => record.status === "Absent"
  ).length;

  const attendanceRate =
    todayRecords.length > 0
      ? Math.round((presentToday / todayRecords.length) * 100)
      : 0;

  const updateField = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
    setError("");
    setNotice("");
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setNotice("");
  };

  const submitAttendance = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.studentId || !form.courseId || !form.date || !form.status) {
      setError("Please complete all required attendance fields.");
      return;
    }

    const duplicate = records.some(
      (record) =>
        String(record.studentId) === String(form.studentId) &&
        String(record.courseId) === String(form.courseId) &&
        record.date === form.date &&
        String(record.id) !== String(editingId)
    );

    if (duplicate) {
      setError(
        "Attendance has already been recorded for this student, course, and date. Edit the existing record instead."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        studentId: String(form.studentId),
        courseId: String(form.courseId),
        date: form.date,
        status: form.status,
      };

      if (editingId !== null) {
        await api.update("attendance", editingId, payload);
        setNotice("Attendance record updated successfully.");
      } else {
        await api.create("attendance", payload);
        setNotice("Attendance marked successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  const editRecord = (record) => {
    setEditingId(record.id);
    setForm({
      studentId: String(record.studentId),
      courseId: String(record.courseId),
      date: record.date,
      status: record.status,
    });
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRecord = async (record) => {
    if (!window.confirm(`Delete attendance for ${studentName(record.studentId)}?`)) {
      return;
    }

    setError("");
    setNotice("");

    try {
      await api.remove("attendance", record.id);
      setRecords((previous) =>
        previous.filter((item) => item.id !== record.id)
      );
      setNotice("Attendance record deleted successfully.");

      if (String(editingId) === String(record.id)) {
        resetForm();
      }
    } catch (err) {
      setError(err.message || "Unable to delete attendance.");
    }
  };

  const exportCsv = () => {
    const escape = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = [
      ["Attendance ID", "Student", "Student ID", "Course", "Date", "Status"],
      ...filteredRecords.map((record) => [
        record.id,
        studentName(record.studentId),
        record.studentId,
        courseName(record.courseId),
        record.date,
        record.status,
      ]),
    ];

    const csv =
      "\uFEFF" +
      rows.map((row) => row.map(escape).join(",")).join("\r\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "unisphere-attendance.csv";
    anchor.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="at-page">
      <section className="at-heading">
        <div>
          <div className="at-eyebrow">
            <span />
            ACADEMIC MANAGEMENT
          </div>
          <h1>Attendance</h1>
          <p>Record, monitor, and manage student attendance.</p>
        </div>

        <button
          type="button"
          className="at-button at-button-secondary"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "at-spin" : ""} />
          Refresh
        </button>
      </section>

      {error && (
        <div className="at-alert at-alert-error" role="alert">
          <XCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {notice && (
        <div className="at-alert at-alert-success" role="status">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}

      <section className="at-stats">
        <article className="at-stat">
          <div className="at-stat-icon purple">
            <ClipboardCheck size={22} />
          </div>
          <div>
            <span>Total records</span>
            <strong>{loading ? "—" : records.length}</strong>
            <small>All attendance entries</small>
          </div>
        </article>

        <article className="at-stat">
          <div className="at-stat-icon green">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span>Present today</span>
            <strong>{loading ? "—" : presentToday}</strong>
            <small>Marked present today</small>
          </div>
        </article>

        <article className="at-stat">
          <div className="at-stat-icon red">
            <XCircle size={22} />
          </div>
          <div>
            <span>Absent today</span>
            <strong>{loading ? "—" : absentToday}</strong>
            <small>Marked absent today</small>
          </div>
        </article>

        <article className="at-stat">
          <div className="at-stat-icon blue">
            <Activity size={22} />
          </div>
          <div>
            <span>Today's attendance</span>
            <strong>{loading ? "—" : `${attendanceRate}%`}</strong>
            <small>Present / records today</small>
          </div>
        </article>
      </section>

      <section className="at-card">
        <div className="at-card-heading">
          <div>
            <h2>{editingId !== null ? "Edit attendance" : "Mark attendance"}</h2>
            <p>
              {editingId !== null
                ? "Update an existing attendance record."
                : "Record a student's attendance for a course."}
            </p>
          </div>
          <CalendarDays size={23} />
        </div>

        <form onSubmit={submitAttendance}>
          <div className="at-form-grid">
            <label className="at-field">
              Student <span>*</span>
              <select
                name="studentId"
                value={form.studentId}
                onChange={updateField}
                required
              >
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} — {student.email}
                  </option>
                ))}
              </select>
            </label>

            <label className="at-field">
              Course <span>*</span>
              <select
                name="courseId"
                value={form.courseId}
                onChange={updateField}
                required
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="at-field">
              Attendance date <span>*</span>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={updateField}
                required
              />
            </label>

            <label className="at-field">
              Attendance status <span>*</span>
              <select
                name="status"
                value={form.status}
                onChange={updateField}
                required
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="at-form-footer">
            <span>
              <CheckCircle2 size={16} />
              Records are saved to your API database.
            </span>

            <div>
              {editingId !== null && (
                <button
                  type="button"
                  className="at-button at-button-secondary"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="at-button at-button-primary"
                disabled={saving || loading}
              >
                {saving ? (
                  <RefreshCw size={16} className="at-spin" />
                ) : (
                  <CheckCircle2 size={17} />
                )}
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update attendance"
                    : "Mark attendance"}
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="at-card at-directory">
        <div className="at-card-heading">
          <div>
            <h2>Attendance directory</h2>
            <p>Search records, filter courses, and update attendance.</p>
          </div>
          <button
            type="button"
            className="at-button at-button-secondary"
            onClick={exportCsv}
            disabled={!filteredRecords.length}
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        <div className="at-toolbar">
          <label className="at-search">
            <Search size={18} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search student, course, or status..."
            />
          </label>

          <label className="at-filter">
            <select
              value={courseFilter}
              onChange={(event) => setCourseFilter(event.target.value)}
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

          <label className="at-filter at-date-filter">
            <CalendarDays size={16} />
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              aria-label="Filter by date"
            />
          </label>

          {dateFilter && (
            <button
              type="button"
              className="at-clear"
              onClick={() => setDateFilter("")}
            >
              Clear date
            </button>
          )}
        </div>

        <div className="at-record-count">
          {filteredRecords.length}{" "}
          {filteredRecords.length === 1 ? "record" : "records"}
        </div>

        {loading ? (
          <div className="at-empty">
            <RefreshCw size={25} className="at-spin" />
            <strong>Loading attendance</strong>
            <span>Retrieving records from your database...</span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="at-empty">
            <div className="at-empty-icon">
              <Users size={28} />
            </div>
            <strong>No attendance records found</strong>
            <span>Mark attendance or adjust your search and filters.</span>
          </div>
        ) : (
          <div className="at-table-wrap">
            <table className="at-table">
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>COURSE</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="at-student">
                        <div className="at-avatar">
                          {studentName(record.studentId)
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <strong>{studentName(record.studentId)}</strong>
                          <span>#{record.studentId}</span>
                        </div>
                      </div>
                    </td>
                    <td>{courseName(record.courseId)}</td>
                    <td>
                      <span className="at-date">
                        <CalendarDays size={14} />
                        {record.date}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`at-status ${
                          statusColors[record.status] || ""
                        }`}
                      >
                        <span />
                        {record.status}
                      </span>
                    </td>
                    <td>
                      <div className="at-actions">
                        <button
                          type="button"
                          title="Edit attendance"
                          aria-label={`Edit attendance for ${studentName(record.studentId)}`}
                          onClick={() => editRecord(record)}
                        >
                          <Clock size={16} />
                        </button>
                        <button
                          type="button"
                          title="Delete attendance"
                          aria-label={`Delete attendance for ${studentName(record.studentId)}`}
                          onClick={() => deleteRecord(record)}
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
        )}

        <div className="at-directory-footer">
          <span>Attendance records synchronized with UniSphere API.</span>
          <span>
            <span className="at-online-dot" />
            Database workspace
          </span>
        </div>
      </section>
    </div>
  );
}

