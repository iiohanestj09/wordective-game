import React from 'react';
import '../Styles/Introduction.css';

const Introduction = () => {
  return (
    <section className="intro-section">
      {/* Kolom Kiri - 60% */}
      <div className="intro-left">
        <div className="icon-text-wrapper">
          <div className="icon-placeholder"></div>
          <p className="text-small">A mystery in every word</p>
        </div>
        
        <h1 className="text-large">lorem ipsum dolor sit amet</h1>
        
        <p className="text-medium">
          lorem ipsum dolor sit amet consectetur adipiscing elit ut omnis est et assumenda aute do mollitia dolore vel accusamus est sit proident et temporibus in possimus sint harum in expedita quibusdam et duis nisi mollitia minus id qui nulla vel qui qui temporibus sunt temporibus dolores irure excepturi qui nihil
        </p>
      </div>

      {/* Kolom Kanan - 40% */}
      <div className="intro-right">
        <div className="illustration-placeholder"></div>
      </div>
    </section>
  );
};

export default Introduction;