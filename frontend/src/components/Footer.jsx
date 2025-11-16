import React from "react";
import { Link } from "react-router-dom";
import { FaLocationArrow, FaPhone } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";

const Footer = () => {
  const hours = [
    {
      id: 1,
      day: "Mon-Fri",
      time: "9:00 AM - 11:00 PM",
    },
    {
      id: 2,
      day: "Saturday",
      time: "9:00 AM - 3:00 PM",
    },
     {
      id: 3,
      day: "Sunday",
      time: "Closed",
    },
    {
      id: 4,
      day: "Emergency:",
      time: "Open 24 x 7",
    },
  ];

  return (
    <>
      <footer className={"container"}>
        <hr />
        <div className="content">
          <div>
            <img src="/logo.png" alt="logo" className="logo-img"/>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul>
              <Link to={"/"}>Home</Link>
              <Link to={"/appointment"}>Appointment</Link>
              <Link to={"/about"}>About</Link>
            </ul>
          </div>
          <div>
            <h4>Hours</h4>
            <ul>
              {hours.map((element) => (
                <li key={element.id}>
                  <span>{element.day}</span>
                  <span>{element.time}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <div>
              <FaPhone />
              <span>870-460-1240</span>
            </div>
            <div>
              <MdEmail />
              <span>info@lifecare.com</span>
            </div>
            <div>
              <FaLocationArrow />
              <span>Monticello, Arkansas 71655</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;