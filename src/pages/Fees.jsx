import { useEffect, useState } from "react";
import { CreditCard, Plus, RefreshCw, Search, Trash2, Download, IndianRupee, Wallet, Clock } from "lucide-react";
import { api } from "../api";

const inputStyle = { width: "100%", padding: "11px 12px", border: "1px solid #e2e8f0", borderRadius: 9, background: "#fff" };
const buttonStyle = { border: 0, borderRadius: 9, padding: "11px 15px", background: "#526df0", color: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 600 };
const cardStyle = { background: "#fff", border: "1px solid #e9edf4", borderRadius: 14, padding: 20 };

function money(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value) || 0);
}

function exportCSV(rows) {
  if (!rows.length) {
    alert("No fee records to export.");
    return;
  }
  const keys = ["studentName", "feeType", "academicYear", "totalAmount", "paidAmount", "balance", "status", "dueDate"];
  const escape = value => '"' + String(value ?? "").replace(/"/g, '""') + '"';
  const csv = [keys.join(","), ...rows.map(r => keys.map(k => escape(r[k])).join(","))].join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "fees-and-payments.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Fees() {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    feeType: "Tuition Fee",
    academicYear: "2026-2027",
    totalAmount: "",
    paidAmount: "0",
    dueDate: ""
  });
  const [payment, setPayment] = useState({ feeId: "", amount: "" });

  async function load() {
    try {
      const [s, f] = await Promise.all([api.list("students"), api.list("fees")]);
      setStudents(Array.isArray(s) ? s : []);
      setFees(Array.isArray(f) ? f : []);
      setForm(v => ({ ...v, studentId: v.studentId || (s?.[0]?.id ? String(s[0].id) : "") }));
      setPayment(v => ({ ...v, feeId: v.feeId || (f?.[0]?.id ? String(f[0].id) : "") }));
    } catch (e) {
      setMessage(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function createFee(event) {
    event.preventDefault();
    const student = students.find(s => String(s.id) === String(form.studentId));
    const total = Number(form.totalAmount);
    const paid = Number(form.paidAmount);
    if (!student) return setMessage("Please select a student.");
    if (!Number.isFinite(total) || total <= 0 || !Number.isFinite(paid) || paid < 0 || paid > total) {
      return setMessage("Enter a valid total amount and paid amount.");
    }
    setBusy(true);
    try {
      const record = {
        ...form,
        studentId: String(student.id),
        studentName: student.name || student.fullName || student.studentName || "Student",
        totalAmount: total,
        paidAmount: paid,
        balance: total - paid,
        status: paid >= total ? "Paid" : paid > 0 ? "Partially Paid" : "Pending",
        dueDate: form.dueDate || ""
      };
      await api.create("fees", record);
      setMessage("Fee record created successfully.");
      setForm(v => ({ ...v, totalAmount: "", paidAmount: "0", dueDate: "" }));
      await load();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function addPayment(event) {
    event.preventDefault();
    const record = fees.find(f => String(f.id) === String(payment.feeId));
    const amount = Number(payment.amount);
    if (!record) return setMessage("Select a fee record.");
    if (!Number.isFinite(amount) || amount <= 0) return setMessage("Enter a payment amount greater than zero.");
    if (amount > Number(record.balance)) return setMessage("Payment cannot exceed the outstanding balance.");
    setBusy(true);
    try {
      const paidAmount = Number(record.paidAmount) + amount;
      const balance = Number(record.totalAmount) - paidAmount;
      await api.update("fees", record.id, {
        ...record,
        paidAmount,
        balance,
        status: balance <= 0 ? "Paid" : "Partially Paid",
        lastPaymentDate: new Date().toISOString().slice(0, 10)
      });
      setMessage("Payment recorded successfully.");
      setPayment(v => ({ ...v, amount: "" }));
      await load();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeFee(id) {
    if (!window.confirm("Delete this fee record?")) return;
    try {
      await api.remove("fees", id);
      setFees(items => items.filter(f => String(f.id) !== String(id)));
      setMessage("Fee record deleted.");
    } catch (e) {
      setMessage(e.message);
    }
  }

  const filtered = fees.filter(f => `${f.studentName} ${f.feeType} ${f.academicYear} ${f.status}`.toLowerCase().includes(search.toLowerCase()));
  const totalFees = fees.reduce((sum, f) => sum + Number(f.totalAmount || 0), 0);
  const totalPaid = fees.reduce((sum, f) => sum + Number(f.paidAmount || 0), 0);
  const totalBalance = fees.reduce((sum, f) => sum + Number(f.balance ?? (Number(f.totalAmount || 0) - Number(f.paidAmount || 0))), 0);

  return (
    <div style={{ padding: "28px 3%", maxWidth: 1450, margin: "0 auto", color: "#202b40" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CreditCard size={28} color="#526df0" />
            <h1 style={{ margin: 0, fontSize: 28 }}>Fees & Payments</h1>
          </div>
          <p style={{ color: "#8792a7", fontSize: 13 }}>Manage student fees, payments, and outstanding balances.</p>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <button onClick={() => exportCSV(filtered)} style={{ ...buttonStyle, background: "#0d9488" }}><Download size={16} /> Export CSV</button>
          <button onClick={load} style={buttonStyle}><RefreshCw size={16} /> Refresh</button>
        </div>
      </div>

      {message && <div style={{ background: "#eef2ff", color: "#3448ad", padding: 13, borderRadius: 9, marginBottom: 18 }}>{message}<button onClick={() => setMessage("")} style={{ float: "right", border: 0, background: "transparent", cursor: "pointer" }}>×</button></div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { title: "Total Fees", value: totalFees, icon: IndianRupee, color: "#526df0" },
          { title: "Amount Collected", value: totalPaid, icon: Wallet, color: "#059669" },
          { title: "Outstanding Balance", value: totalBalance, icon: Clock, color: "#ea580c" }
        ].map(item => {
          const Icon = item.icon;
          return <div key={item.title} style={cardStyle}><div style={{ display: "flex", justifyContent: "space-between", color: "#8792a7", fontSize: 13 }}>{item.title}<Icon size={19} color={item.color} /></div><div style={{ fontSize: 25, fontWeight: 800, marginTop: 14 }}>{money(item.value)}</div></div>;
        })}
      </div>

      <section style={{ ...cardStyle, marginBottom: 22 }}>
        <h2 style={{ marginTop: 0, fontSize: 19 }}>Create fee record</h2>
        <form onSubmit={createFee} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 15 }}>
          <label>Student<select required value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} style={{ ...inputStyle, display: "block", marginTop: 7 }}><option value="">Select student</option>{students.map(s => <option key={s.id} value={s.id}>{s.name || s.fullName || s.studentName || `Student ${s.id}`}</option>)}</select></label>
          <label>Fee type<select value={form.feeType} onChange={e => setForm({ ...form, feeType: e.target.value })} style={{ ...inputStyle, display: "block", marginTop: 7 }}>{["Tuition Fee", "Examination Fee", "Library Fee", "Laboratory Fee", "Transport Fee", "Other"].map(t => <option key={t}>{t}</option>)}</select></label>
          <label>Academic year<input required value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} style={{ ...inputStyle, display: "block", marginTop: 7 }} /></label>
          <label>Total amount (?)<input required type="number" min="0.01" step="0.01" value={form.totalAmount} onChange={e => setForm({ ...form, totalAmount: e.target.value })} placeholder="e.g. 25000" style={{ ...inputStyle, display: "block", marginTop: 7 }} /></label>
          <label>Initial payment (?)<input required type="number" min="0" step="0.01" value={form.paidAmount} onChange={e => setForm({ ...form, paidAmount: e.target.value })} style={{ ...inputStyle, display: "block", marginTop: 7 }} /></label>
          <label>Due date<input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} style={{ ...inputStyle, display: "block", marginTop: 7 }} /></label>
          <div style={{ display: "flex", alignItems: "end" }}><button type="submit" disabled={busy} style={buttonStyle}><Plus size={17} /> Create Fee</button></div>
        </form>
      </section>

      <section style={{ ...cardStyle, marginBottom: 22 }}>
        <h2 style={{ marginTop: 0, fontSize: 19 }}>Record a payment</h2>
        <form onSubmit={addPayment} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 15 }}>
          <label>Fee record<select required value={payment.feeId} onChange={e => setPayment({ ...payment, feeId: e.target.value })} style={{ ...inputStyle, display: "block", marginTop: 7 }}><option value="">Select fee record</option>{fees.filter(f => Number(f.balance ?? (Number(f.totalAmount) - Number(f.paidAmount))) > 0).map(f => <option key={f.id} value={f.id}>{f.studentName} — {f.feeType} — Balance {money(f.balance ?? (Number(f.totalAmount) - Number(f.paidAmount)))}</option>)}</select></label>
          <label>Payment amount (?)<input required type="number" min="0.01" step="0.01" value={payment.amount} onChange={e => setPayment({ ...payment, amount: e.target.value })} style={{ ...inputStyle, display: "block", marginTop: 7 }} /></label>
          <div style={{ display: "flex", alignItems: "end" }}><button type="submit" disabled={busy} style={buttonStyle}><IndianRupee size={17} /> Record Payment</button></div>
        </form>
      </section>

      <section style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div><h2 style={{ margin: 0, fontSize: 19 }}>Fee records</h2><span style={{ color: "#8792a7", fontSize: 13 }}>{filtered.length} record(s)</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #e2e8f0", borderRadius: 9, padding: "0 10px" }}><Search size={17} color="#8792a7" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search fees..." style={{ ...inputStyle, border: 0, width: 190 }} /></div>
        </div>
        <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 900 }}>
          <thead style={{ background: "#f7f8fc" }}><tr>{["Student", "Fee Type", "Academic Year", "Total", "Paid", "Balance", "Due Date", "Status", "Action"].map(h => <th key={h} style={{ padding: 13, fontSize: 12, color: "#8792a7", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
          <tbody>{filtered.map(f => <tr key={f.id} style={{ borderTop: "1px solid #edf0f5" }}>
            <td style={{ padding: 13, fontWeight: 600 }}>{f.studentName}</td><td style={{ padding: 13 }}>{f.feeType}</td><td style={{ padding: 13 }}>{f.academicYear}</td><td style={{ padding: 13 }}>{money(f.totalAmount)}</td><td style={{ padding: 13, color: "#059669" }}>{money(f.paidAmount)}</td><td style={{ padding: 13, color: Number(f.balance) > 0 ? "#ea580c" : "#059669" }}>{money(f.balance ?? (Number(f.totalAmount) - Number(f.paidAmount)))}</td><td style={{ padding: 13 }}>{f.dueDate || "—"}</td><td style={{ padding: 13 }}><span style={{ padding: "5px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: f.status === "Paid" ? "#dcfce7" : f.status === "Partially Paid" ? "#fef3c7" : "#fee2e2", color: f.status === "Paid" ? "#166534" : f.status === "Partially Paid" ? "#92400e" : "#991b1b" }}>{f.status}</span></td><td style={{ padding: 13 }}><button onClick={() => removeFee(f.id)} title="Delete fee record" style={{ border: 0, background: "#fff0f0", color: "#d33", padding: 9, borderRadius: 8, cursor: "pointer" }}><Trash2 size={16} /></button></td>
          </tr>)}
          {!filtered.length && <tr><td colSpan="9" style={{ textAlign: "center", padding: 35, color: "#8792a7" }}>No fee records yet. Create your first record above.</td></tr>}</tbody>
        </table></div>
      </section>
    </div>
  );
}
