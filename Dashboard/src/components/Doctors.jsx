import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import { MdMoreVert } from "react-icons/md";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [editDoctor, setEditDoctor] = useState(null);
  const [deleteDoctor, setDeleteDoctor] = useState(null);
  const { isAuthenticated } = useContext(Context);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/user/doctors",
          { withCredentials: true }
        );
        setDoctors(data.doctors);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch doctors");
      }
    };
    fetchDoctors();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:4000/api/v1/user/doctors/${id}`,
        { withCredentials: true }
      );
      setDoctors(doctors.filter(doc => doc._id !== id));
      toast.success("Doctor deleted successfully");
      setDeleteDoctor(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const handleUpdate = async (updatedDoctor, newAvatarFile) => {
    try {
      const formData = new FormData();
      for (const key in updatedDoctor) {
        if (key !== "_id") formData.append(key, updatedDoctor[key]);
      }
      if (newAvatarFile) formData.append("docAvatar", newAvatarFile);

      const { data } = await axios.put(
        `http://localhost:4000/api/v1/user/doctors/${updatedDoctor._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      setDoctors(doctors.map(doc => doc._id === updatedDoctor._id ? data.doctor : doc));
      toast.success("Doctor updated successfully");
      setEditDoctor(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <section className="page doctors" style={{ position: "relative" }}>
      <h1>DOCTORS</h1>
      <div className="banner" style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {doctors.length > 0 ? doctors.map(doc => (
          <div
            key={doc._id}
            className="card"
            style={{
              position: "relative",
              padding: 20,
              border: "1px solid #000",
              borderRadius: 8,
              width: 280,
              color: "black",
              background: "white",
              boxSizing: "border-box",
              margin: "0 auto",
            }}
            onMouseLeave={() => setMenuOpenFor(null)}
          >

            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                cursor: "pointer",
                fontSize: 26,
                userSelect: "none",
                color: "black",
                zIndex: 100,
                background: "white",
                borderRadius: "50%",
                width: 30,
                height: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onClick={() => setMenuOpenFor(menuOpenFor === doc._id ? null : doc._id)}
            >
              <MdMoreVert />

            </div>

            <img
              src={doc.docAvatar?.url}
              alt="doctor avatar"
              style={{ width: 80, height: 80, borderRadius: "50%" }}
            />
            <h4>{doc.firstName} {doc.lastName}</h4>
            <div className="details" style={{ fontSize: 14, marginBottom: 10 }}>
              <p>Email: <span>{doc.email}</span></p>
              <p>Phone: <span>{doc.phone}</span></p>
              <p>DOB: <span>{doc.dob.substring(0, 10)}</span></p>
              <p>Department: <span>{doc.doctorDepartment}</span></p>
              <p>Gender: <span>{doc.gender}</span></p>
            </div>
            {menuOpenFor === doc._id && (
              <div
                style={{
                  position: "absolute",
                  top: 40,
                  right: 10,
                  width: 110,
                  background: "white",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  zIndex: 20,
                }}
              >
                <button
                  style={{ width: "100%", padding: 8, border: "none", background: "none", cursor: "pointer", textAlign: "left" }}
                  onClick={() => { setEditDoctor(doc); setMenuOpenFor(null); }}
                >
                  Edit
                </button>
                <button
                  style={{ width: "100%", padding: 8, border: "none", background: "none", cursor: "pointer", color: "red", textAlign: "left" }}
                  onClick={() => { setDeleteDoctor(doc); setMenuOpenFor(null); }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )) : <h1>No Registered Doctors Found!</h1>}
      </div>

      {editDoctor && <EditDoctorModal doctor={editDoctor} onCancel={() => setEditDoctor(null)} onUpdate={handleUpdate} />}
      {deleteDoctor && <DeleteConfirmModal doctorName={`${deleteDoctor.firstName} ${deleteDoctor.lastName}`} onCancel={() => setDeleteDoctor(null)} onConfirm={() => handleDelete(deleteDoctor._id)} />}
    </section>
  );
};

const EditDoctorModal = ({ doctor, onCancel, onUpdate }) => {
  const [formData, setFormData] = React.useState({
    _id: doctor._id,
    firstName: doctor.firstName || "",
    lastName: doctor.lastName || "",
    email: doctor.email || "",
    phone: doctor.phone || "",
    dob: doctor.dob ? doctor.dob.substring(0, 10) : "",
    doctorDepartment: doctor.doctorDepartment || "",
    gender: doctor.gender || "",
  });
  const [newAvatarFile, setNewAvatarFile] = React.useState(null);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => {
    if (e.target.files.length > 0) setNewAvatarFile(e.target.files[0]);
  };

  const handleSubmit = e => {
    e.preventDefault();
    onUpdate(formData, newAvatarFile);
  };

  return (
    <div style={modalBackdropStyle}>
      <div style={modalContentStyle}>
        <h2>Edit Doctor</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }} encType="multipart/form-data">
          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
          <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
          <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
          <input type="text" name="doctorDepartment" value={formData.doctorDepartment} onChange={handleChange} required />
          <select name="gender" value={formData.gender} onChange={handleChange} required >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <label>
            Change Avatar:
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} />
          </label>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" onClick={onCancel}>Cancel</button>
            <button type="submit" style={{ background: "green", color: "white" }}>Update</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ doctorName, onCancel, onConfirm }) => (
  <div style={modalBackdropStyle}>
    <div style={modalContentStyle}>
      <h3>Confirm Delete</h3>
      <p>Are you sure you want to delete doctor <strong>{doctorName}</strong>?</p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onConfirm} style={{ background: "red", color: "white" }}>Delete</button>
      </div>
    </div>
  </div>
);

const modalBackdropStyle = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0,0,0,0.3)", display: "flex",
  justifyContent: "center", alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  background: "white", padding: 32, borderRadius: 8,
  maxWidth: 420, width: "90%", boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
  textAlign: "center",
};

export default Doctors;
