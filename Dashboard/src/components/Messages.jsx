import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import { AiOutlineDelete } from "react-icons/ai";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { isAuthenticated } = useContext(Context);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/message/getall",
          { withCredentials: true }
        );
        setMessages(data.messages);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch messages");
      }
    };
    fetchMessages();
  }, []);

  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(
        `http://localhost:4000/api/v1/message/delete/${id}`,
        { withCredentials: true }
      );
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
      toast.success(data.message);
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <section className="page messages">
      <h1>MESSAGES</h1>
      <div className="banner" style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {messages && messages.length > 0 ? (
          messages.map((element) => (
            <div
              className="card"
              key={element._id}
              style={{
                border: "1px solid #eee",
                borderRadius: 8,
                padding: 20,
                minWidth: 280,
                position: "relative",
              }}
            >
              <div className="details">
                <p>First Name: <span>{element.firstName}</span></p>
                <p>Last Name: <span>{element.lastName}</span></p>
                <p>Email: <span>{element.email}</span></p>
                <p>Phone: <span>{element.phone}</span></p>
                <p>Message: <span>{element.message}</span></p>
              </div>
              <button
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  position: "absolute",
                  top: 16,
                  right: 16,
                  borderRadius: "50%",
                  padding: 5,
                  transition: "background 0.2s"
                }}
                onMouseOver={e =>
                  (e.currentTarget.style.background = "#ffeaea")
                }
                onMouseOut={e =>
                  (e.currentTarget.style.background = "transparent")
                }
                title="Delete Message"
                onClick={() => setDeleteTarget(element)}
              >
                <AiOutlineDelete
                  style={{
                    color: "red",
                    fontSize: 22,
                    transition: "color 0.15s"
                  }}
                />
              </button>
            </div>
          ))
        ) : (
          <h1>No Messages!</h1>
        )}
      </div>
      {deleteTarget && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.35)", zIndex: 1000,
          display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{
            background: "white", padding: 32, borderRadius: 12, minWidth: 340,
            boxShadow: "0 4px 20px rgba(0,0,0,0.22)", textAlign: "center"
          }}>
            <AiOutlineDelete style={{ color: "red", fontSize: 36, marginBottom: 8 }} />
            <h2 style={{ marginBottom: 8, color: "#333" }}>Delete Message?</h2>
            <p style={{ marginBottom: 24, color: "#444" }}>
              Are you sure you want to delete<br />
              <strong>
                {deleteTarget.firstName} {deleteTarget.lastName}
              </strong>
              's message?
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
                  cursor: "pointer"
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
                  cursor: "pointer"
                }}
                onClick={() => handleDelete(deleteTarget._id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Messages;
