import React from 'react'

const Hero = ({title, imageUrl}) => {
  return (
    <div className="hero container">
        <div className="banner">

          <h1>{title}</h1>
          <p>
            LifeCare Medical Center in Monticello, Arkansas, was established in 2010 to provide quality healthcare close to home for residents of Drew County and surrounding communities. Founded by local physicians and civic leaders, the center was created to address the lack of accessible medical services in the region. Over time, it has grown into a trusted community hospital offering comprehensive care in family medicine, emergency services, surgery, and rehabilitation. Guided by compassion and commitment, LifeCare Medical Center continues to serve Monticello with the mission of delivering exceptional healthcare for every patient.
          </p>
        </div>
        <div className="banner">
          <img src={imageUrl} alt="hero" className="animated-image"/>
          <span>
            <img src="/Vector.png" alt="vector" />
          </span>
        </div>
    </div>
  )
}

export default Hero;