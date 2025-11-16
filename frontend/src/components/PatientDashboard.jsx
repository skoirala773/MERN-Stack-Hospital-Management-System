import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Context } from "../main";
import { FaTrashAlt, FaSave, FaTimes, FaEdit } from "react-icons/fa";

const statusColors = {
  Pending: "#f1c40f",
  Accepted: "#27ae60",
  Rejected: "#e74c3c",
};

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const { user } = useContext(Context);
  const [doctors, setDoctors] = useState([]);
  const [departments] = useState([
    "Pediatrics",
    "Orthopedics",
    "Cardiology",
    "Neurology",
    "Oncology",
    "Radiology",
    "Physical Therapy",
    "Dermatology",
    "ENT",
  ]);
  const [editAppointmentId, setEditAppointmentId] = useState(null);
  const [editData, setEditData] = useState({ date: "", doctorId: "", department: "" });

  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/v1/appointment/mypatient",
        { withCredentials: true }
      );
      setAppointments(data.appointments);
    } catch {
      toast.error("Failed to fetch appointments", { position: "top-center" });
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/v1/user/doctors",
        { withCredentials: true }
      );
      setDoctors(data.doctors);
    } catch {
      toast.error("Failed to fetch doctors", { position: "top-center" });
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/v1/appointment/delete/${id}`, {
        withCredentials: true,
      });
      toast.success("Appointment deleted", { position: "top-center" });
      fetchAppointments();
    } catch {
      toast.error("Failed to delete appointment", { position: "top-center" });
    }
  };

  const handleEdit = (apt) => {
    setEditAppointmentId(apt._id);

    const dateToParse = apt.appointment_date.includes("T")
      ? apt.appointment_date
      : `${apt.appointment_date}T00:00:00.000Z`;

    const appointmentDate = new Date(dateToParse);

    const month = String(appointmentDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(appointmentDate.getUTCDate()).padStart(2, "0");
    const year = appointmentDate.getUTCFullYear();
    const dateString = `${month}/${day}/${year}`;

    setEditData({
      date: dateString,
      doctorId: apt.doctor._id,
      department: apt.department || "",
    });
  };

  const formatDateToISO = (dateStr) => {
    const [month, day, year] = dateStr.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  const handleSave = async () => {
    if (!editData.date || !editData.doctorId || !editData.department) {
      toast.error("Please fill all fields", { position: "top-center" });
      return;
    }

    const newDoctor = doctors.find((doc) => doc._id === editData.doctorId);

    const finalAppointmentDate = formatDateToISO(editData.date);

    try {
      const { data } = await axios.put(
        `http://localhost:4000/api/v1/appointment/update/${editAppointmentId}`,
        {
          appointment_date: finalAppointmentDate,
          doctorId: editData.doctorId,
          department: editData.department,
          status: "Pending",
          edited: true,
        },
        { withCredentials: true }
      );

      setAppointments((prevAppointments) =>
        prevAppointments.map((apt) => {
          if (apt._id === editAppointmentId) {
            return data.appointment
              ? {
                ...data.appointment,
                appointment_date: finalAppointmentDate,
              }
              : {
                ...apt,
                appointment_date: finalAppointmentDate,
                department: editData.department,
                doctor: newDoctor
                  ? {
                    _id: newDoctor._id,
                    firstName: newDoctor.firstName,
                    lastName: newDoctor.lastName,
                  }
                  : apt.doctor,
                status: "Pending",
              };
          }
          return apt;
        })
      );

      toast.success("Appointment updated", { position: "top-center" });
      setEditAppointmentId(null);
      fetchAppointments();
    } catch (error) {
      console.error("Update Error:", error.response ? error.response.data : error.message);
      toast.error("Failed to update appointment.");
    }
  };

  const filteredDoctors = doctors.filter(
    (doc) => doc.doctorDepartment === editData.department
  );

  const dropdownStyle = {
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "4px",
    padding: "6px 30px 6px 10px",
    fontSize: "1rem",
    cursor: "pointer",
    position: "relative",
    backgroundImage:
      "url('data:image/svg+xml;utf8,<svg fill=\"%23999\" height=\"10\" width=\"10\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"0,0 20,0 10,10\" /></svg>')",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
  };

  return (
    <div className="dashboard-container" style={{ padding: "20px", paddingTop: "70px" }}>
      <ToastContainer position="top-center" />

      <h2 style={{ color: "#20385b", marginBottom: 5 }}>
        Welcome
        {user.firstName || user.lastName
          ? `, ${user.firstName || ""} ${user.lastName || ""}`
          : ""}
        !
      </h2>

      <h3 style={{ color: "#333", marginBottom: 20 }}>Appointments</h3>
      {appointments.length === 0 ? (
        <p style={{ fontSize: 18, color: "#999" }}>No appointments found.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            boxShadow: "0 0 12px rgba(0,0,0,0.05)",
          }}
        >
          <thead style={{ backgroundColor: "#2941ab", color: "#fff" }}>
            <tr>
              <th style={{ padding: "12px 16px", textAlign: "left" }}>Date</th>
              <th style={{ padding: "12px 16px", textAlign: "left" }}>Doctor</th>
              <th style={{ padding: "12px 16px", textAlign: "left" }}>Department</th>
              <th style={{ padding: "12px 16px" }}>Status</th>
              <th style={{ padding: "12px 16px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt) => {
              const isEditing = editAppointmentId === apt._id;
              const status = apt.status || "Pending";

              const dateToDisplay = apt.appointment_date.includes("T")
                ? new Date(apt.appointment_date)
                : new Date(`${apt.appointment_date}T00:00:00.000Z`);

              const month = String(dateToDisplay.getUTCMonth() + 1).padStart(2, "0");
              const day = String(dateToDisplay.getUTCDate()).padStart(2, "0");
              const year = dateToDisplay.getUTCFullYear();
              const displayDate = `${month}/${day}/${year}`;

              return (
                <tr key={apt._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px 16px" }}>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formatDateToISO(editData.date)}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => {
                          const dateValue = e.target.value;
                          const [year, month, day] = dateValue.split("-");
                          setEditData({ ...editData, date: `${month}/${day}/${year}` });
                        }}
                        style={{ padding: "6px", fontSize: "1rem" }}
                      />
                    ) : (
                      (() => {
                        const d = new Date(apt.appointment_date);
                        const month = String(d.getUTCMonth() + 1).padStart(2, "0");
                        const day = String(d.getUTCDate()).padStart(2, "0");
                        const year = d.getUTCFullYear();
                        return `${ month } /${day}/${ year }`;
                      })()
                    )}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {isEditing ? (
                      <select
                        value={editData.doctorId}
                        onChange={(e) => setEditData({ ...editData, doctorId: e.target.value })}
                        style={dropdownStyle}
                        disabled={!editData.department}
                      >
                        <option value="">Select Doctor</option>
                        {filteredDoctors.map((doc) => (
                          <option key={doc._id} value={doc._id}>
                            {doc.firstName} {doc.lastName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      `${apt.doctor.firstName} ${apt.doctor.lastName}`
                    )}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {isEditing ? (
                      <select
                        value={editData.department}
                        onChange={(e) =>
                          setEditData({ ...editData, department: e.target.value, doctorId: "" })
                        }
                        style={dropdownStyle}
                      >
                        <option value="">Select Department</option>
                        {departments.map((dep, i) => (
                          <option key={i} value={dep}>
                            {dep}
                          </option>
                        ))}
                      </select>
                    ) : (
                      apt.department
                    )}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 12,
                        color: "white",
                        backgroundColor: statusColors[status] || "#7f8c8d",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        userSelect: "none",
                        display: "inline-block",
                        minWidth: 85,
                        textAlign: "center",
                      }}
                    >
                      {status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <FaTrashAlt
                      onClick={() => handleDelete(apt._id)}
                      style={{
                        color: "#e74c3c",
                        cursor: "pointer",
                        marginRight: isEditing ? 20 : 10,
                        fontSize: 18,
                        verticalAlign: "middle",
                      }}
                      title="Delete"
                      onMouseOver={(e) => (e.currentTarget.style.color = "#c0392b")}
                      onMouseOut={(e) => (e.currentTarget.style.color = "#e74c3c")}
                    />
                    {isEditing ? (
                      <span
                        style={{ display: "inline-flex", gap: "15px", alignItems: "center" }}
                      >
                        <FaSave
                          onClick={handleSave}
                          style={{
                            color: "#27ae60",
                            cursor: "pointer",
                            fontSize: 18,
                          }}
                          title="Save"
                          onMouseOver={(e) => (e.currentTarget.style.color = "#2ecc71")}
                          onMouseOut={(e) => (e.currentTarget.style.color = "#27ae60")}
                        />
                        <FaTimes
                          onClick={() => setEditAppointmentId(null)}
                          style={{
                            color: "#7f8c8d",
                            cursor: "pointer",
                            fontSize: 18,
                          }}
                          title="Cancel"
                          onMouseOver={(e) => (e.currentTarget.style.color = "#95a5a6")}
                          onMouseOut={(e) => (e.currentTarget.style.color = "#7f8c8d")}
                        />
                      </span>
                    ) : (
                      <FaEdit
                        onClick={() => handleEdit(apt)}
                        style={{
                          color: "#2980b9",
                          cursor: "pointer",
                          fontSize: 18,
                          marginLeft: 10,
                        }}
                        title="Edit"
                        onMouseOver={(e) => (e.currentTarget.style.color = "#3498db")}
                        onMouseOut={(e) => (e.currentTarget.style.color = "#2980b9")}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PatientDashboard;
