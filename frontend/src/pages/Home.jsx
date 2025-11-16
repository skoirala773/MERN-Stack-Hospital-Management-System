import React from 'react';
import Hero from "../components/Hero";
import Biography from "../components/Biography";
import Departments from "../components/Departments";
import MessageForm from "../components/MessageForm";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <>
    <Hero title={"Welcome to Lifecare Medical Center | Your Trusted Healthcare Provider"} imageUrl={"/hero.png"}/>
    <Biography imageUrl={"/about.png"}/>
    <Departments/>
    <MessageForm/>
     <Footer />
    </>
  );
}

export default Home