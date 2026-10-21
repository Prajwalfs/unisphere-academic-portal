import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  Mail,
  Phone,
  UserRound,
  Building2,
  AlertCircle,
  LoaderCircle,
  Save,
} from "lucide-react";
import { api } from "../api";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  department: "",
};

export default function StudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    const loadStudent = async () => {
      if (!id) {
        setForm(emptyForm);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const student = await api.get("students", id);

        if (active) {
          if (!student || typeof student !== "object") {
            throw new Error("Student record was not found.");
          }

          setForm({
            name: student.name || "",
            email: student.email || "",
            phone: student.phone || "",
            department: student.department || "",
          });
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load student details.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadStudent();

    return () => {
      active = false;
    };
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const data = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      department: form.department.trim(),
    };

    if (!data.name || !data.email) {
      setError("Please enter the student's name and email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (data.phone && !/^[+\d\s()-]{7,20}$/.test(data.phone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    setSaving(true);

    try {
      if (isEditing) {
        await api.update("students", id, data);
        setSuccess("Student details updated successfully.");
      } else {
        await api.create("students", data);
        setSuccess("Student registered successfully.");
      }

      navigate("/students", {
        state: {
          notice: isEditing
            ? "Student details updated successfully."
            : "Student registered successfully.",
        },
      });
    } catch (err) {
      setError(
        err.message ||
          `Unable to ${isEditing ? "update" : "register"} the student.`
      );
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    {
      name: "name",
      label: "Full name",
      placeholder: "Enter student's full name",
      icon: UserRound,
      required: true,
      type: "text",
      description: "Enter the student's full name.",
    },
    {
      name: "email",
      label: "Email address",
      placeholder: "student@university.edu",
      icon: Mail,
      required: true,
      type: "email",
      description: "Use a valid email address.",
    },
    {
      name: "phone",
      label: "Phone number",
      placeholder: "Enter contact number",
      icon: Phone,
      required: false,
      type: "tel",
      description: "Include the country code if applicable.",
    },
    {
      name: "department",
      label: "Department",
      placeholder: "Select a department",
      icon: Building2,
      required: false,
      type: "select",
      description: "Choose the student's academic department.",
    },
  ];

  return (
    <div className="sf-page">
      <div className="sf-breadcrumb">
        <Link to="/students">
          <ArrowLeft size={16} />
          Students
        </Link>
        <span>/</span>
        <span>{isEditing ? "Edit student" : "Add student"}</span>
      </div>

      <section className="sf-heading">
        <div className="sf-heading-icon">
          <GraduationCap size={27} />
        </div>

        <div>
          <div className="sf-eyebrow">ACADEMIC MANAGEMENT</div>
          <h1>{isEditing ? "Edit student" : "Register a student"}</h1>
          <p>
            {isEditing
              ? "Update the student's information and academic details."
              : "Add a new student to your university directory."}
          </p>
        </div>
      </section>

      {error && (
        <div className="sf-alert sf-alert-error" role="alert">
          <AlertCircle size={19} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="sf-alert sf-alert-success" role="status">
          <CheckCircle2 size={19} />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="sf-loading">
          <LoaderCircle className="sf-spin" size={28} />
          <strong>Loading student details</strong>
          <span>Please wait while we retrieve the record.</span>
        </div>
      ) : (
        <form className="sf-card" onSubmit={handleSubmit}>
          <div className="sf-card-heading">
            <div>
              <h2>Student information</h2>
              <p>Fields marked with * are required.</p>
            </div>

            <span className="sf-required-badge">
              {isEditing ? "EDIT RECORD" : "NEW RECORD"}
            </span>
          </div>

          <div className="sf-divider" />

          <div className="sf-form-grid">
            {fields.map((field) => {
              const Icon = field.icon;

              return (
                <div className="sf-field" key={field.name}>
                  <label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="sf-asterisk"> *</span>}
                  </label>

                  <div className="sf-input-wrap">
                    <Icon size={18} />

                    {field.type === "select" ? (
                      <select
                        id={field.name}
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                      >
                        <option value="">Select department</option>
                        <option value="CSE">Computer Science (CSE)</option>
                        <option value="ECE">Electronics (ECE)</option>
                        <option value="Engineering">Engineering</option>
                        <option value="ISE">Information Science (ISE)</option>
                        <option value="EEE">Electrical Engineering (EEE)</option>
                        <option value="Mechanical">Mechanical Engineering</option>
                        <option value="Civil">Civil Engineering</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={form[field.name]}
                        onChange={handleChange}
                        required={field.required}
                        autoComplete={
                          field.name === "name"
                            ? "name"
                            : field.name === "email"
                              ? "email"
                              : field.name === "phone"
                                ? "tel"
                                : "off"
                        }
                        maxLength={field.name === "name" ? 100 : 254}
                      />
                    )}
                  </div>

                  <small>{field.description}</small>
                </div>
              );
            })}
          </div>

          <div className="sf-divider" />

          <div className="sf-form-footer">
            <span className="sf-footer-note">
              <CheckCircle2 size={16} />
              Changes are saved to your university database.
            </span>

            <div className="sf-actions">
              <button
                type="button"
                className="sf-button sf-button-cancel"
                onClick={() => navigate("/students")}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="sf-button sf-button-save"
                disabled={saving}
              >
                {saving ? (
                  <LoaderCircle className="sf-spin" size={17} />
                ) : (
                  <Save size={17} />
                )}
                {saving
                  ? "Saving..."
                  : isEditing
                    ? "Update student"
                    : "Register student"}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="sf-security-note">
        <CheckCircle2 size={17} />
        <span>
          <strong>University workspace</strong>
          <span>Your student information is managed through the UniSphere API.</span>
        </span>
      </div>
    </div>
  );
}