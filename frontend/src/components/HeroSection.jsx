import React from 'react';
import '../styles/HeroSection.css';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const navigate = useNavigate();

    const handleExplore = () => {
        navigate('/bookclubs'); 
    };

    const handleJoinNow = () => {
        navigate('/log-in'); 
    };

    return (
        <section className="hero">
            <div className="hero-content">
                <h1>Discover, Connect, and Discuss with Fellow Book Lovers</h1>
                <p>
                    Join BookNook to find your next great read, connect with like-minded readers, 
                    and participate in engaging book discussions.
                </p>
                <div className="hero-buttons">
                    <button onClick={handleExplore} className="btn btn-primary">Explore Book Clubs</button>
                    <button onClick={handleJoinNow} className="btn btn-secondary">Join Now</button>
                </div>
            </div>
            
            <div className="book-stack">
                <div className="book book-1">BookNook</div>
                <div className="book book-2"></div>
                <div className="book book-3"></div>
            </div>
        </section>
    );
};

export default HeroSection;