import { useEffect, useState } from "react";
import { FileBarChart, RefreshCw, Download, Users, BookOpen, ClipboardCheck, Award, GraduationCap } from "lucide-react";
import { api } from "../api";

const cardStyle = { background: "#fff", border: "1px solid #e9edf4", borderRadius: 15, padding: 22 };
const muted = { color: "#8792a7", fontSize: 13 };

function downloadCSV(filename, rows) {
  if (!rows.length) {
    alert("No data available to export.");
    return;
  }
  const keys = [...new Set(rows.flatMap(row => Object.keys(row)))];
  const escape = value => '"' + String(value ?? "").replace(/"/g, '""') + '"';
  const csv = [keys.map(escape).join(","), ...rows.map(row => keys.map(key => escape(row[key])).join(","))].join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [data, setData] = useState({
    students: [],
    courses: [],
    enrollments: [],
    attendance: [],
    examinations: [],
    results: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const names = ["students", "courses", "enrollments", "attendance", "examinations", "results"];
      const values = await Promise.all(names.map(name => api.list(name)));
      const next = {};
      names.forEach((name, index) => {
        next[name] = Array.isArray(values[index]) ? values[index] : [];
      });
      setData(next);
    } catch (e) {
      setError(e.message || "Unable to load report data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const present = data.attendance.filter(a => String(a.status).toLowerCase() === "present").length;
  const absent = data.attendance.filter(a => String(a.status).toLowerCase() === "absent").length;
  const attendanceRate = data.attendance.length ? Math.round(present / data.attendance.length * 100) : 0;
  const passed = data.results.filter(r => String(r.status).toLowerCase() === "pass").length;
  const failed = data.results.filter(r => String(r.status).toLowerCase() === "fail").length;
  const average = data.results.length ? (data.results.reduce((sum, r) => sum + Number(r.percentage || 0), 0) / data.results.length).toFixed(1) : "0.0";

  const stats = [
    { label: "Total Students", value: data.students.length, icon: Users, color: "#526df0" },
    { label: "Total Courses", value: data.courses.length, icon: BookOpen, color: "#0d9488" },
    { label: "Enrollments", value: data.enrollments.length, icon: GraduationCap, color: "#9333ea" },
    { label: "Attendance Rate", value: attendanceRate + "%", icon: ClipboardCheck, color: "#ea580c" },
    { label: "Examinations", value: data.examinations.length, icon: FileBarChart, color: "#2563eb" },
    { label: "Results Recorded", value: data.results.length, icon: Award, color: "#db2777" }
  ];

  const sectionTitle = { fontSize: 18, margin: "0 0 16px" };
  const th = { padding: 13, textAlign: "left", fontSize: 12, color: "#8792a7", background: "#f7f8fc", whiteSpace: "nowrap" };
  const td = { padding: 13, borderTop: "1px solid #edf0f5", fontSize: 13 };

  return (
    <div style={{ padding: "28px 3%", maxWidth: 1450, margin: "0 auto", color: "#202b40" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FileBarChart size={29} color="#526df0" />
            <h1 style={{ fontSize: 28, margin: 0 }}>Reports & Analytics</h1>
          </div>
          <p style={{ ...muted, marginBottom: 0 }}>Academic performance and institutional statistics.</p>
        </div>
        <button onClick={load} style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", border: 0, borderRadius: 9, background: "#526df0", color: "#fff", cursor: "pointer" }}>
          <RefreshCw size={16} /> Refresh Reports
        </button>
      </div>

      {error && <div style={{ padding: 14, borderRadius: 9, background: "#fee2e2", color: "#991b1b", marginBottom: 20 }}>{error}</div>}
      {loading && <p style={{ color: "#8792a7" }}>Loading report data...</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))", gap: 16, marginBottom: 24 }}>
        {stats.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <span style={muted}>{item.label}</span>
                <span style={{ background: item.color + "15", color: item.color, padding: 9, borderRadius: 10 }}><Icon size={19} /></span>
              </div>
              <div style={{ fontSize: 30, fontWeight: 800 }}>{item.value}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 18, marginBottom: 24 }}>
        <section style={cardStyle}>
          <h2 style={sectionTitle}>Attendance Summary</h2>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><span style={muted}>Present</span><strong>{present}</strong></div>
          <div style={{ height: 9, background: "#edf0f5", borderRadius: 10, overflow: "hidden", marginBottom: 18 }}><div style={{ width: attendanceRate + "%", height: "100%", background: "#10b981", borderRadius: 10 }} /></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><span style={muted}>Absent</span><strong>{absent}</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={muted}>Overall recorded attendance</span><strong>{attendanceRate}%</strong></div>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitle}>Examination Performance</h2>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}><span style={muted}>Students passed</span><strong style={{ color: "#059669" }}>{passed}</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}><span style={muted}>Students failed</span><strong style={{ color: "#dc2626" }}>{failed}</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}><span style={muted}>Average percentage</span><strong>{average}%</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={muted}>Results recorded</span><strong>{data.results.length}</strong></div>
        </section>
      </div>

      <section style={{ ...cardStyle, padding: 0, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div><h2 style={{ ...sectionTitle, marginBottom: 4 }}>Course Enrollment Report</h2><span style={muted}>Enrollment count by course</span></div>
          <button onClick={() => downloadCSV("course-enrollment-report.csv", data.courses.map(c => ({ courseId: c.id, course: c.name || c.title, enrollments: data.enrollments.filter(e => String(e.courseId) === String(c.id)).length })))} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer" }}><Download size={16} /> Export CSV</button>
        </div>
        <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["Course ID", "Course Name", "Enrollments"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>{data.courses.map(c => <tr key={c.id}><td style={td}>{c.id}</td><td style={td}>{c.name || c.title || "—"}</td><td style={td}>{data.enrollments.filter(e => String(e.courseId) === String(c.id)).length}</td></tr>)}
            {!data.courses.length && <tr><td colSpan="3" style={{ ...td, textAlign: "center" }}>No courses available.</td></tr>}</tbody>
        </table></div>
      </section>

      <section style={{ ...cardStyle, padding: 0, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div><h2 style={{ ...sectionTitle, marginBottom: 4 }}>Student Performance Report</h2><span style={muted}>Recorded examination results</span></div>
          <button onClick={() => downloadCSV("student-results-report.csv", data.results.map(r => ({ student: r.studentName, examination: r.examinationName, course: r.courseName, marks: r.marksObtained, totalMarks: r.totalMarks, percentage: r.percentage, grade: r.grade, status: r.status })))} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer" }}><Download size={16} /> Export CSV</button>
        </div>
        <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 650 }}>
          <thead><tr>{["Student", "Examination", "Marks", "Percentage", "Grade", "Status"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>{data.results.map(r => <tr key={r.id}><td style={td}>{r.studentName}</td><td style={td}>{r.examinationName}</td><td style={td}>{r.marksObtained}/{r.totalMarks}</td><td style={td}>{r.percentage}%</td><td style={td}>{r.grade}</td><td style={{ ...td, color: r.status === "Pass" ? "#059669" : "#dc2626", fontWeight: 700 }}>{r.status}</td></tr>)}
            {!data.results.length && <tr><td colSpan="6" style={{ ...td, textAlign: "center" }}>No examination results have been recorded yet.</td></tr>}</tbody>
        </table></div>
      </section>

      <section style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div><h2 style={{ ...sectionTitle, marginBottom: 4 }}>Student Directory Report</h2><span style={muted}>Registered students</span></div>
          <button onClick={() => downloadCSV("student-directory-report.csv", data.students)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer" }}><Download size={16} /> Export CSV</button>
        </div>
        <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead><tr>{["Student ID", "Name", "Email", "Department"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>{data.students.map(s => <tr key={s.id}><td style={td}>{s.id}</td><td style={td}>{s.name || s.fullName || s.studentName || "—"}</td><td style={td}>{s.email || "—"}</td><td style={td}>{s.department || s.course || "—"}</td></tr>)}
            {!data.students.length && <tr><td colSpan="4" style={{ ...td, textAlign: "center" }}>No students available.</td></tr>}</tbody>
        </table></div>
      </section>
      <p style={{ ...muted, textAlign: "center", marginTop: 24 }}>Reports are generated from the current records in your database.</p>
    </div>
  );
}
