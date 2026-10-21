import { useEffect, useState } from "react";
import { CalendarDays, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { api } from "../api";

const fieldStyle = { width: "100%", padding: "11px 12px", border: "1px solid #e2e8f0", borderRadius: 9, background: "#fff", outline: "none" };
const buttonStyle = { border: 0, borderRadius: 9, padding: "11px 16px", background: "#526df0", color: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 600 };

export default function Examinations() {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ name: "", courseId: "", date: "", startTime: "", duration: 60, totalMarks: 100, passMarks: 35 });
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const [e, c] = await Promise.all([api.list("examinations"), api.list("courses")]);
      setExams(Array.isArray(e) ? e : []);
      setCourses(Array.isArray(c) ? c : []);
      setForm(f => ({ ...f, courseId: f.courseId || (c?.[0]?.id ? String(c[0].id) : "") }));
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function submit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.courseId || !form.date) {
      setMessage("Enter the exam name, course, and date.");
      return;
    }
    if (+form.passMarks > +form.totalMarks || +form.totalMarks <= 0) {
      setMessage("Pass marks cannot exceed total marks.");
      return;
    }
    setBusy(true);
    try {
      const course = courses.find(c => String(c.id) === String(form.courseId));
      await api.create("examinations", {
        ...form,
        name: form.name.trim(),
        courseId: form.courseId,
        courseName: course?.name || course?.title || "Course",
        duration: Number(form.duration),
        totalMarks: Number(form.totalMarks),
        passMarks: Number(form.passMarks)
      });
      setMessage("Examination scheduled successfully.");
      setForm(f => ({ ...f, name: "", date: "", startTime: "" }));
      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this examination?")) return;
    try {
      await api.remove("examinations", id);
      setExams(items => items.filter(item => String(item.id) !== String(id)));
      setMessage("Examination deleted.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  const filtered = exams.filter(e => `${e.name} ${e.courseName} ${e.date}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: "28px 3%", color: "#202b40", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CalendarDays size={28} color="#526df0" />
            <h1 style={{ margin: 0, fontSize: 28 }}>Examinations</h1>
          </div>
          <p style={{ color: "#8792a7", marginBottom: 0 }}>Schedule and manage examinations.</p>
        </div>
        <button style={buttonStyle} onClick={load}><RefreshCw size={16} /> Refresh</button>
      </div>

      {message && <div style={{ background: "#eef2ff", color: "#3448ad", padding: 13, borderRadius: 9, marginBottom: 18 }}>{message}<button onClick={() => setMessage("")} style={{ float: "right", border: 0, background: "transparent", cursor: "pointer" }}>×</button></div>}

      <section style={{ background: "#fff", padding: 22, borderRadius: 15, border: "1px solid #e9edf4", marginBottom: 24 }}>
        <h2 style={{ fontSize: 19, marginTop: 0 }}>Schedule an examination</h2>
        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 15 }}>
          <label>Examination name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mid Semester Exam" style={{ ...fieldStyle, display: "block", marginTop: 7 }} /></label>
          <label>Course<select required value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })} style={{ ...fieldStyle, display: "block", marginTop: 7 }}><option value="">Select course</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name || c.title}</option>)}</select></label>
          <label>Exam date<input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={{ ...fieldStyle, display: "block", marginTop: 7 }} /></label>
          <label>Start time<input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} style={{ ...fieldStyle, display: "block", marginTop: 7 }} /></label>
          <label>Duration (minutes)<input required type="number" min="1" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} style={{ ...fieldStyle, display: "block", marginTop: 7 }} /></label>
          <label>Total marks<input required type="number" min="1" value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: e.target.value })} style={{ ...fieldStyle, display: "block", marginTop: 7 }} /></label>
          <label>Pass marks<input required type="number" min="0" value={form.passMarks} onChange={e => setForm({ ...form, passMarks: e.target.value })} style={{ ...fieldStyle, display: "block", marginTop: 7 }} /></label>
          <div style={{ display: "flex", alignItems: "end" }}><button disabled={busy} type="submit" style={buttonStyle}><Plus size={17} /> {busy ? "Saving..." : "Schedule Exam"}</button></div>
        </form>
      </section>

      <section style={{ background: "#fff", border: "1px solid #e9edf4", borderRadius: 15, overflow: "hidden" }}>
        <div style={{ padding: 20, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div><h2 style={{ margin: 0, fontSize: 19 }}>Examination schedule</h2><span style={{ color: "#8792a7", fontSize: 13 }}>{filtered.length} examination(s)</span></div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", border: "1px solid #e2e8f0", borderRadius: 9, padding: "0 10px" }}><Search size={17} color="#8792a7" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exams..." style={{ ...fieldStyle, border: 0, width: 190 }} /></div>
        </div>
        <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 700 }}>
          <thead style={{ background: "#f7f8fc" }}><tr>{["Exam", "Course", "Date", "Time", "Duration", "Marks", "Action"].map(h => <th key={h} style={{ padding: 14, fontSize: 12, color: "#8792a7" }}>{h}</th>)}</tr></thead>
          <tbody>{filtered.map(e => <tr key={e.id} style={{ borderTop: "1px solid #edf0f5" }}><td style={{ padding: 14, fontWeight: 600 }}>{e.name}</td><td style={{ padding: 14 }}>{e.courseName || courses.find(c => String(c.id) === String(e.courseId))?.name || "—"}</td><td style={{ padding: 14 }}>{e.date}</td><td style={{ padding: 14 }}>{e.startTime || "—"}</td><td style={{ padding: 14 }}>{e.duration} min</td><td style={{ padding: 14 }}>{e.totalMarks} <span style={{ color: "#8792a7" }}>(pass {e.passMarks})</span></td><td style={{ padding: 14 }}><button onClick={() => remove(e.id)} title="Delete examination" style={{ border: 0, background: "#fff0f0", color: "#d33", padding: 9, borderRadius: 8, cursor: "pointer" }}><Trash2 size={16} /></button></td></tr>)}
          {!filtered.length && <tr><td colSpan="7" style={{ textAlign: "center", padding: 35, color: "#8792a7" }}>No examinations found. Schedule your first exam above.</td></tr>}</tbody>
        </table></div>
      </section>
    </div>
  );
}
