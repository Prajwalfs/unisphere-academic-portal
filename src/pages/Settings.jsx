import { useEffect, useState } from "react";
import { Save, RotateCcw, CheckCircle2, Settings as SettingsIcon } from "lucide-react";

const defaults = {
portalName: "UniSphere Academic Portal",
institutionName: "BMS College of Engineering",
academicYear: "2026-2027",
semester: "Odd Semester",
contactEmail: "[admin@example.com](mailto:admin@example.com)",
defaultDepartment: "Computer Science and Engineering",
};

export default function SettingsPage() {
const [settings, setSettings] = useState(defaults);
const [saved, setSaved] = useState(false);

useEffect(() => {
try {
const stored = localStorage.getItem("unisphere-settings");
if (stored) setSettings({ ...defaults, ...JSON.parse(stored) });
} catch {
setSettings(defaults);
}
}, []);

function handleChange(event) {
setSettings({ ...settings, [event.target.name]: event.target.value });
setSaved(false);
}

function handleSave(event) {
event.preventDefault();
localStorage.setItem("unisphere-settings", JSON.stringify(settings));
setSaved(true);
}

function handleReset() {
setSettings(defaults);
localStorage.setItem("unisphere-settings", JSON.stringify(defaults));
setSaved(true);
}

const inputStyle = {
width: "100%",
padding: "12px 14px",
border: "1px solid var(--border-color, #dbe1ea)",
borderRadius: "9px",
background: "var(--card-bg, #ffffff)",
color: "var(--text-color, #1f2937)",
fontSize: "14px",
boxSizing: "border-box",
};

const labelStyle = {
display: "block",
marginBottom: "8px",
fontSize: "13px",
fontWeight: 600,
};

function field(name, label, placeholder = "") {
return ( <div key={name}> <label htmlFor={name} style={labelStyle}>{label}</label> <input
       id={name}
       name={name}
       value={settings[name]}
       onChange={handleChange}
       placeholder={placeholder}
       required
       style={inputStyle}
     /> </div>
);
}

return (
<section style={{ maxWidth: 1050, margin: "0 auto", paddingBottom: 32 }}>
<div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
<div style={{ padding: 13, borderRadius: 12, background: "#e8efff", color: "#3659bd" }}> <SettingsIcon size={27} /> </div> <div>
<h1 style={{ margin: 0, fontSize: 26 }}>Portal Settings</h1>
<p style={{ margin: "6px 0 0", color: "var(--muted-color, #64748b)" }}>
Configure your academic portal preferences. </p> </div> </div>

  {saved && (
    <div role="status" style={{ display: "flex", alignItems: "center", gap: 9, padding: 14, marginBottom: 20, borderRadius: 10, background: "#e8f8ee", color: "#187443" }}>
      <CheckCircle2 size={19} />
      Settings saved successfully.
    </div>
  )}

  <form onSubmit={handleSave}>
    <div style={{ border: "1px solid var(--border-color, #e2e8f0)", borderRadius: 14, padding: 24, marginBottom: 20, background: "var(--card-bg, #ffffff)" }}>
      <h2 style={{ marginTop: 0, marginBottom: 22, fontSize: 18 }}>Institution Information</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 22 }}>
        {field("portalName", "Portal Name")}
        {field("institutionName", "Institution Name")}
        {field("academicYear", "Academic Year")}
        <div>
          <label htmlFor="semester" style={labelStyle}>Current Semester</label>
          <select id="semester" name="semester" value={settings.semester} onChange={handleChange} style={inputStyle}>
            <option>Odd Semester</option>
            <option>Even Semester</option>
            <option>Summer Semester</option>
          </select>
        </div>
      </div>
    </div>

    <div style={{ border: "1px solid var(--border-color, #e2e8f0)", borderRadius: 14, padding: 24, marginBottom: 22, background: "var(--card-bg, #ffffff)" }}>
      <h2 style={{ marginTop: 0, marginBottom: 22, fontSize: 18 }}>System Preferences</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 22 }}>
        {field("contactEmail", "Administrator Contact Email")}
        {field("defaultDepartment", "Default Department")}
      </div>
      <p style={{ fontSize: 12, color: "var(--muted-color, #64748b)", marginBottom: 0 }}>
        These preferences are stored in this browser on this device.
      </p>
    </div>

    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <button type="submit" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px", border: 0, borderRadius: 9, background: "#3659bd", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
        <Save size={17} /> Save Settings
      </button>
      <button type="button" onClick={handleReset} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px", border: "1px solid var(--border-color, #dbe1ea)", borderRadius: 9, background: "transparent", color: "var(--text-color, #334155)", fontWeight: 600, cursor: "pointer" }}>
        <RotateCcw size={17} /> Reset Defaults
      </button>
    </div>
  </form>
</section>


);
}
