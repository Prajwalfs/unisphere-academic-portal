import { useEffect, useState } from "react";
import { Award, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { api } from "../api";

const inputStyle = { width: "100%", padding: "11px 12px", border: "1px solid #e2e8f0", borderRadius: 9, background: "#fff" };
const buttonStyle = { border: 0, borderRadius: 9, padding: "11px 16px", background: "#526df0", color: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 600 };

function gradeFor(percentage) {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  if (percentage >= 35) return "E";
  return "F";
}

export default function Results() {
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [form, setForm] = useState({ studentId: "", examinationId: "", marksObtained: "" });
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const [s, e, r] = await Promise.all([api.list("students"), api.list("examinations"), api.list("results")]);
      setStudents(Array.isArray(s) ? s : []);
      setExams(Array.isArray(e) ? e : []);
      setResults(Array.isArray(r) ? r : []);
      setForm(f => ({ ...f, studentId: f.studentId || (s?.[0]?.id ? String(s[0].id) : ""), examinationId: f.examinationId || (e?.[0]?.id ? String(e[0].id) : "") }));
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function submit(event) {
    event.preventDefault();
    const student = students.find(s => String(s.id) === String(form.studentId));
    const exam = exams.find(e => String(e.id) === String(form.examinationId));
    const marks = Number(form.marksObtained);
    if (!student || !exam) {
      setMessage("Add at least one student and schedule an examination first.");
      return;
    }
    if (form.marksObtained === "" || marks < 0 || marks > Number(exam.totalMarks)) {
      setMessage(`Marks must be between 0 and ${exam.totalMarks}.`);
      return;
    }
    setBusy(true);
    try {
      const percentage = Number(((marks / Number(exam.totalMarks)) * 100).toFixed(2));
      await api.create("results", {
        studentId: String(student.id),
        studentName: student.name || student.fullName || student.studentName || "Student",
        examinationId: String(exam.id),
        examinationName: exam.name,
        courseName: exam.courseName || "",
        marksObtained: marks,
        totalMarks: Number(exam.totalMarks),
        percentage,
        grade: gradeFor(percentage),
        status: marks >= Number(exam.passMarks) ? "Pass" : "Fail",
        date: new Date().toISOString().slice(0, 10)
      });
      setMessage("Result saved successfully.");
      setForm(f => ({ ...f, marksObtained: "" }));
      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this result?")) return;
    try {
      await api.remove("results", id);
      setResults(items => items.filter(item => String(item.id) !== String(id)));
      setMessage("Result deleted.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  const filtered = results.filter(r => `${r.studentName} ${r.examinationName} ${r.courseName} ${r.grade} ${r.status}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: "28px 3%", color: "#202b40", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Award size={28} color="#526df0" /><h1 style={{ margin: 0, fontSize: 28 }}>Academic Results</h1></div><p style={{ color: "#8792a7", marginBottom: 0 }}>Record marks and track student performance.</p></div>
        <button style={buttonStyle} onClick={load}><RefreshCw size={16} /> Refresh</button>
      </div>

      {message && <div style={{ background: "#eef2ff", color: "#3448ad", padding: 13, borderRadius: 9, marginBottom: 18 }}>{message}<button onClick={() => setMessage("")} style={{ float: "right", border: 0, background: "transparent", cursor: "pointer" }}>×</button></div>}

      <section style={{ background: "#fff", padding: 22, borderRadius: 15, border: "1px solid #e9edf4", marginBottom: 24 }}>
        <h2 style={{ fontSize: 19, marginTop: 0 }}>Enter student result</h2>
        {(!students.length || !exams.length) && <p style={{ color: "#b45309" }}>You need students and scheduled examinations before entering results.</p>}
        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 15 }}>
          <label>Student<select required value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} style={{ ...inputStyle, display: "block", marginTop: 7 }}><option value="">Select student</option>{students.map(s => <option key={s.id} value={s.id}>{s.name || s.fullName || s.studentName || `Student ${s.id}`}</option>)}</select></label>
          <label>Examination<select required value={form.examinationId} onChange={e => setForm({ ...form, examinationId: e.target.value })} style={{ ...inputStyle, display: "block", marginTop: 7 }}><option value="">Select examination</option>{exams.map(e => <option key={e.id} value={e.id}>{e.name} — {e.courseName || "Course"}</option>)}</select></label>
          <label>Marks obtained<input required type="number" min="0" max={exams.find(e => String(e.id) === String(form.examinationId))?.totalMarks || 100} step="0.01" value={form.marksObtained} onChange={e => setForm({ ...form, marksObtained: e.target.value })} placeholder="Enter marks" style={{ ...inputStyle, display: "block", marginTop: 7 }} /></label>
          <div style={{ display: "flex", alignItems: "end" }}><button disabled={busy} type="submit" style={buttonStyle}><Plus size={17} /> {busy ? "Saving..." : "Save Result"}</button></div>
        </form>
        {form.examinationId && <p style={{ color: "#8792a7", fontSize: 13, marginBottom: 0, marginTop: 12 }}>Maximum marks: {exams.find(e => String(e.id) === String(form.examinationId))?.totalMarks ?? "—"} · Pass marks: {exams.find(e => String(e.id) === String(form.examinationId))?.passMarks ?? "—"}</p>}
      </section>

      <section style={{ background: "#fff", border: "1px solid #e9edf4", borderRadius: 15, overflow: "hidden" }}>
        <div style={{ padding: 20, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div><h2 style={{ margin: 0, fontSize: 19 }}>Results register</h2><span style={{ color: "#8792a7", fontSize: 13 }}>{filtered.length} result(s)</span></div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", border: "1px solid #e2e8f0", borderRadius: 9, padding: "0 10px" }}><Search size={17} color="#8792a7" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search results..." style={{ ...inputStyle, border: 0, width: 190 }} /></div>
        </div>
        <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 760 }}>
          <thead style={{ background: "#f7f8fc" }}><tr>{["Student", "Examination", "Marks", "Percentage", "Grade", "Status", "Action"].map(h => <th key={h} style={{ padding: 14, fontSize: 12, color: "#8792a7" }}>{h}</th>)}</tr></thead>
          <tbody>{filtered.map(r => <tr key={r.id} style={{ borderTop: "1px solid #edf0f5" }}><td style={{ padding: 14, fontWeight: 600 }}>{r.studentName || "Student"}</td><td style={{ padding: 14 }}>{r.examinationName || "Examination"}</td><td style={{ padding: 14 }}>{r.marksObtained} / {r.totalMarks}</td><td style={{ padding: 14 }}>{r.percentage}%</td><td style={{ padding: 14, fontWeight: 700 }}>{r.grade}</td><td style={{ padding: 14 }}><span style={{ padding: "5px 9px", borderRadius: 20, background: r.status === "Pass" ? "#dcfce7" : "#fee2e2", color: r.status === "Pass" ? "#166534" : "#991b1b", fontSize: 12, fontWeight: 700 }}>{r.status}</span></td><td style={{ padding: 14 }}><button onClick={() => remove(r.id)} title="Delete result" style={{ border: 0, background: "#fff0f0", color: "#d33", padding: 9, borderRadius: 8, cursor: "pointer" }}><Trash2 size={16} /></button></td></tr>)}
          {!filtered.length && <tr><td colSpan="7" style={{ textAlign: "center", padding: 35, color: "#8792a7" }}>No results yet. Record a result using the form above.</td></tr>}</tbody>
        </table></div>
      </section>
    </div>
  );
}
