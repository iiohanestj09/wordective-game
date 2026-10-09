import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css'; 
import '../Styles/Introduction.css';

const Introduction = () => {
  const backendUrl = 'http://localhost:5000';
  
  const carouselImages = [
    `${backendUrl}/images/icons/board1.svg`,
    `${backendUrl}/images/icons/board2.svg`, 
    `${backendUrl}/images/icons/board3.svg`,
  ];
  const extendedImages = [...carouselImages, carouselImages[0]];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (document.visibilityState !== 'visible') return;

      setIsTransitioning(true);
      setCurrentImageIndex((prevIndex) => Math.min(prevIndex + 1, carouselImages.length));
    }, 3000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsTransitioning(false);
        setCurrentImageIndex(0);
      } else {
        setIsTransitioning(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [carouselImages.length]);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  const handleTransitionEnd = () => {
    if (currentImageIndex === carouselImages.length) {
      setIsTransitioning(false);
      setCurrentImageIndex(0);
    }
  };

  return (
    <>
      {/* SECTION 1: Introduction */}
      <section id="intro" className="intro-section">
        <div className="intro-left">
          <div className="icon-text-wrapper" data-aos="flip-up" data-aos-delay="400">
            <div className="icon-intro"></div>
            <p className="text-small">A mystery in every word</p>
          </div>
          <h1 className="text-large" data-aos="fade-right">Read Between the Lines, Where Every Word Could Hide a Clue.</h1>
          <p className="text-medium" data-aos="fade-up">
            Wordective turns English reading into an engaging mystery experience, helping you practice understanding texts, recognizing important details, and connecting information along the way.
          </p>

          <div className="start-game-container" data-aos="flip-down" data-aos-delay="300">
            <button className="start-game-btn">
              Let's Start The Game
            </button>
          </div>
        </div>

        <div className="intro-right" data-aos="zoom-in" data-aos-delay="200">
          <div className="carousel-container">
            <div 
              className="carousel-track"
              onTransitionEnd={handleTransitionEnd}
              style={{ 
                transform: `translateX(-${currentImageIndex * 100}%)`,
                transition: isTransitioning ? 'transform 0.6s ease-in-out' : 'none'
              }}
            >
              {extendedImages.map((src, index) => (
                <img 
                  key={index}
                  className="illustration-placeholder" 
                  src={src} 
                  alt={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Description */}
      <section id="description" className="tutorial-section">
        <h2 className="tutorial-header" data-aos="fade-up">Description</h2>
        
        <div className="tutorial-cards-container">
          <div className="tutorial-card" data-aos="fade-up" data-aos-delay="100">
            <img className='desc-icon' src={`${backendUrl}/images/icons/desc1.svg`} alt="Reading" />
            <h3 className="tutorial-card-title">Reading</h3>
            <p className="tutorial-card-desc">
                Read and understand stories, statements, and clues in English while paying attention to important details, context, and information that may help you uncover the meaning behind the case.
            </p>
          </div>

          <div className="tutorial-card" data-aos="fade-up" data-aos-delay="300">
            <img className='desc-icon' src={`${backendUrl}/images/icons/desc2.svg`} alt="Recall" />
            <h3 className="tutorial-card-title">Recall</h3>
            <p className="tutorial-card-desc">
              Remember important information from what you have read and bring those details back when needed, especially when connecting different pieces of information or making your final decision.
            </p>
          </div>

          <div className="tutorial-card" data-aos="fade-up" data-aos-delay="500">
            <img className='desc-icon' src={`${backendUrl}/images/icons/desc3.svg`} alt="Reasoning" />
            <h3 className="tutorial-card-title">Reasoning</h3>
            <p className="tutorial-card-desc">
              Analyze and connect the information you have gathered, compare different details, identify relationships and contradictions, and use logical thinking to determine what the evidence means.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: About Us */}
      <section id="about" className="about-section">
        <h2 className="about-header" data-aos="fade-up">About Us</h2>
        
        <div className="about-cards-container">
          <div className="about-card" data-aos="flip-right" data-aos-delay="100">
            <img className='about-photo' src={`${backendUrl}/images/icons/profil1.svg`} alt="Arsyad" />
            <h3 className="about-card-title">Arsyad</h3>
            <p className="about-card-desc"><b><i>Muhammad Arsyad Labiq</i></b></p>
            <p className="about-card-desc">240221606256</p>
            <p className="about-card-desc">English Language Education</p>
          </div>

          <div className="about-card" data-aos="flip-right" data-aos-delay="300">
            <img className='about-photo' src={`${backendUrl}/images/icons/profil2.svg`} alt="Niko" />
            <h3 className="about-card-title">Niko</h3>
            <p className="about-card-desc"><b><i>Nikolaus Langgut</i></b></p>
            <p className="about-card-desc">250751624669</p>
            <p className="about-card-desc">Sociology Education</p>
          </div>

          <div className="about-card" data-aos="flip-right" data-aos-delay="500">
            <img className='about-photo' src={`${backendUrl}/images/icons/profil3.svg`} alt="Putra" />
            <h3 className="about-card-title">Putra</h3>
            <p className="about-card-desc"><b><i>Yohanes Putra P. Muwa Dae</i></b></p>
            <p className="about-card-desc">240535604155</p>
            <p className="about-card-desc">Informatics Engineering</p>
          </div>
        </div>
        <div className="about-info-container">
          <div className="about-info-item">
            <img className='about-info-icon' src={`${backendUrl}/images/icons/course.svg`} alt="Course" />
            <p className="about-info-text">Course: Management of Inovation</p>
          </div>

          <div className="about-info-item">
            <img className='about-info-icon' src={`${backendUrl}/images/icons/dosen.svg`} alt="Supporting Lecturer" />
            <p className="about-info-text">Supporting Lecturer: Dr. Siti Mas'ula, M.Pd</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Introduction;