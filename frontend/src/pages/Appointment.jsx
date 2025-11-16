import React from "react";
import Hero from "../components/Hero";
import AppointmentForm from "../components/AppointmentForm";
import Footer from "../components/Footer";

const Appointment = () => {
  return (
    <>
      <Hero
        title={"Schedule Your Appointment | Lifecare Medical Center"}
        imageUrl={"/signin.png"}
      />
      <AppointmentForm/>
      <Footer/>
    </>
  );
};

export default Appointment;