import React from "react";

const Biography = ({imageUrl}) => {
  return (
    <>
      <div className="container biography">
        <div className="banner">
          <img src={imageUrl} alt="whoweare" />
        </div>
        <div className="banner">

          <h3>Who We Are</h3>
          <p>
          At LifeCare Medical Center, we are a team of dedicated healthcare professionals committed to providing exceptional medical care with compassion and integrity. Our mission is to serve the Monticello community by delivering patient-centered healthcare that promotes healing, wellness, and trust. We believe in combining advanced medical technology with a personal touch, ensuring that every patient feels valued and cared for. From our skilled doctors and nurses to our supportive staff, we work together to make LifeCare a place where quality care and community come together.
          </p>
          <p>
          </p>
        </div>
      </div>
    </>
  );
};

export default Biography;