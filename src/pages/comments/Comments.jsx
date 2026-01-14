import React from 'react';
import Banner from "../../components/banner/Banner";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import "./Comments.css";

function Comments() {
  return (
    <>
      <Header />
      <Banner title={"Comments"} />
      <div className="container mx-auto p-10 text-center text-white">
          <h2 className="text-2xl">Comments Section Coming Soon</h2>
          <p className="text-gray-400">We are migrating our database. Check back later!</p>
      </div>
      <Footer />
    </>
  );
}

export default Comments;
