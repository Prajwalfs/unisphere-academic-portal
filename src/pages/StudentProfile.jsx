import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
ArrowLeft,
UserRound,
Mail,
Phone,
Building2,
GraduationCap,
Pencil,
RefreshCw,
Hash,
} from "lucide-react";
import { api } from "../api";

export default function StudentProfile() {
const { id } = useParams();
const [student, setStudent] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
let active = true;

const loadProfile = async () => {
  setLoading(true);
  setError("");

  try {
    const data = await api.get("students", id);

    if (!data || typeof data !== "object") {
      throw new Error("Student record was not found.");
    }

    if (active) setStudent(data);
  } catch (err) {
    if (active) setError(err.message || "Unable to load student profile.");
  } finally {
    if (active) setLoading(false);
  }
};

loadProfile();

return () => {
  active = false;
};

}, [id]);

if (loading) {
return ( <div className="sp-state"> <RefreshCw size={25} className="sp-spin" /> <strong>Loading student profile</strong> </div>
);
}

if (error || !student) {
return ( <div className="sp-state"> <strong>Unable to open student profile</strong> <span>{error || "Student record was not found."}</span> <Link to="/students" className="sp-button sp-button-secondary">
Back to students </Link> </div>
);
}

const details = [
{ label: "Student ID", value: student.id, icon: Hash },
{ label: "Email address", value: student.email, icon: Mail },
{ label: "Phone number", value: student.phone, icon: Phone },
{ label: "Department", value: student.department, icon: Building2 },
];

return ( <div className="sp-page"> <section className="sp-heading"> <div> <div className="sp-eyebrow"> <span />
ACADEMIC MANAGEMENT </div> <h1>Student Profile</h1> <p>View student information and academic identity.</p> </div>


    <div className="sp-heading-actions">
      <Link to="/students" className="sp-button sp-button-secondary">
        <ArrowLeft size={16} />
        Back to students
      </Link>
      <Link
        to={`/students/${student.id}/edit`}
        className="sp-button sp-button-primary"
      >
        <Pencil size={16} />
        Edit profile
      </Link>
    </div>
  </section>

  <section className="sp-directory">
    <div className="sp-student-cell" style={{ padding: "28px" }}>
      <div className="sp-avatar" style={{ width: 76, height: 76, fontSize: 25 }}>
        <UserRound size={32} />
      </div>
      <div className="sp-student-name">
        <strong style={{ fontSize: 25 }}>{student.name || "Unnamed student"}</strong>
        <span>
          <GraduationCap size={16} />
          {student.department || "Department not assigned"}
        </span>
        <span>
          <span className="sp-status">
            <span />
            Registered
          </span>
        </span>
      </div>
    </div>

    <div className="sp-form-grid" style={{ padding: 28 }}>
      {details.map(({ label, value, icon: Icon }) => (
        <article className="sp-stat-card" key={label}>
          <div className="sp-stat-icon">
            <Icon size={21} />
          </div>
          <div className="sp-stat-copy">
            <span>{label}</span>
            <strong style={{ overflowWrap: "anywhere", fontSize: 16 }}>
              {value || "Not provided"}
            </strong>
          </div>
        </article>
      ))}
    </div>
  </section>

  <section className="sp-directory" style={{ marginTop: 24 }}>
    <div className="sp-directory-heading">
      <div>
        <h2>Academic records</h2>
        <p>Academic information associated with this student.</p>
      </div>
    </div>

    <div className="sp-state">
      <GraduationCap size={28} />
      <strong>Academic records are not configured yet</strong>
      <span>
        Course enrollments, attendance, examination marks, and SGPA will
        be connected in the next upgrade.
      </span>
    </div>
  </section>
</div>


);
}
