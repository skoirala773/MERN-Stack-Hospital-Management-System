import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle, AiOutlineDelete } from "react-icons/ai";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/appointment/getall",
          { withCredentials: true }
        );

        setAppointments(data.appointments || []);
      } catch (error) {
        setAppointments([]);
      }
    };

    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/user/doctors",
          { withCredentials: true }
        );
        setDoctors(data.doctors || []);
      } catch (error) {
        setDoctors([]);
      }
    };

    fetchAppointments();
    fetchDoctors();
  }, []);

  const formatDateMMDDYYYYFromISO = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      const { data } = await axios.put(
        `http://localhost:4000/api/v1/appointment/update/${appointmentId}`,
        { status },
        { withCredentials: true }
      );
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status }
            : appointment
        )
      );
      toast.success(data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed");
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.delete(
        `http://localhost:4000/api/v1/appointment/delete/${appointmentId}`,
        { withCredentials: true }
      );
      setAppointments((prev) =>
        prev.filter((appointment) => appointment._id !== appointmentId)
      );
      toast.success(data.message);
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  const { isAuthenticated, admin } = useContext(Context);
  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <>
      <section className="dashboard page">
        <div className="banner">
          <div className="firstBox">
            <img src="/doc.png" alt="docImg" />
            <div className="content">
              <div>
                <p>Hello ,</p>
                <h5>
                  {admin && `${admin.firstName} ${admin.lastName}`}{" "}
                </h5>
              </div>
              <p>
                View scheduled appointments and manage your healthcare team in one place.
                Easily add, remove, or edit doctors as needed for efficient scheduling and staffing.
              </p>
            </div>
          </div>
          <div className="secondBox">
            <p>Total Appointments</p>
            <h3>{appointments.length}</h3>
          </div>
          <div className="thirdBox">
            <p>Registered Doctors</p>
            <h3>{doctors.length}</h3>
          </div>
        </div>
        <div className="banner">
          <h5>Appointments</h5>
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date</th>
                <th>Doctor</th>
                <th>Department</th>
                <th>Status</th>
                <th>Visited</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {appointments && appointments.length > 0
                ? appointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td>{`${appointment.firstName} ${appointment.lastName}`}</td>
                      <td>{formatDateMMDDYYYYFromISO(appointment.appointment_date)}</td>
                      <td>
                        {appointment.doctor &&
                          `${appointment.doctor.firstName} ${appointment.doctor.lastName}`}
                      </td>
                      <td>{appointment.department}</td>
                      <td>
                        <select
                          className={
                            appointment.status === "Pending"
                              ? "value-pending"
                              : appointment.status === "Accepted"
                              ? "value-accepted"
                              : "value-rejected"
                          }
                          value={appointment.status}
                          onChange={(e) =>
                            handleUpdateStatus(appointment._id, e.target.value)
                          }
                        >
                          <option value="Pending" className="value-pending">
                            Pending
                          </option>
                          <option value="Accepted" className="value-accepted">
                            Accepted
                          </option>
                          <option value="Rejected" className="value-rejected">
                            Rejected
                          </option>
                        </select>
                      </td>
                      <td>
                        {appointment.hasVisited === true ? (
                          <GoCheckCircleFill className="green" />
                        ) : (
                          <AiFillCloseCircle className="red" />
                        )}
                      </td>
                      <td>
                        <button
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            borderRadius: "50%",
                            padding: 6,
                            transition: "background 0.2s",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.background = "#ffeaea")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                          onClick={() => setDeleteTarget(appointment)}
                          title="Delete Appointment"
                        >
                          <AiOutlineDelete
                            style={{
                              color: "red",
                              fontSize: 22,
                              transition: "color 0.15s",
                            }}
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                : (
                  <tr>
                    <td colSpan={7}>No Appointments Found!</td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </section>
      {deleteTarget && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: 32,
              borderRadius: 12,
              minWidth: 340,
              boxShadow: "0 4px 20px rgba(0,0,0,0.22)",
              textAlign: "center",
            }}
          >
            <AiOutlineDelete style={{ color: "red", fontSize: 36, marginBottom: 8 }} />
            <h2 style={{ marginBottom: 8, color: "#333" }}>Delete Appointment?</h2>
            <p style={{ marginBottom: 24, color: "#444" }}>
              Are you sure you want to delete
              <br />
              <strong>
                {deleteTarget.firstName} {deleteTarget.lastName}
              </strong>
              ’s appointment?
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  padding: "8px 26px",
                  borderRadius: "5px",
                  border: "none",
                  background: "#f1f1f1",
                  color: "#333",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: "8px 26px",
                  borderRadius: "5px",
                  border: "none",
                  background: "red",
                  color: "#fff",
                  cursor: "pointer",
                }}
                onClick={() => handleDeleteAppointment(deleteTarget._id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
