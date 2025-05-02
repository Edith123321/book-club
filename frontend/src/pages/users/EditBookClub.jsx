import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditBookClub = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Hardcoded initial data matching BookClubDetails.jsx
  const initialData = {
    clubName: 'Classic Literature Club',
    founder: 'Jane Austen',
    yearFounded: 'January 2024',
    members: 42,
    about: `Welcome to the Classic Literature Club! We're dedicated to exploring timeless literary works that have shaped our culture and understanding of the human experience.
From ancient epics to 20th-century masterpieces, we delve into the themes, characters, and historical contexts of these influential texts.
Join us for engaging discussions, thought-provoking analyses, and a shared love for the written word. Whether you're a seasoned reader or just starting your literary journey, there's a place for you here.
Our club meets monthly to discuss a selected book, and we also host special events such as author talks, film screenings, and writing workshops.
We believe in the power of literature to inspire, challenge, and connect us. Together, let's explore the beauty and complexity of classic literature.
We look forward to welcoming you to our next meeting!`
  };

  const [formData, setFormData] = useState(initialData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'members' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate update
    alert(`Book Club Updated:\n
Club Name: ${formData.clubName}
Founder: ${formData.founder}
Year Founded: ${formData.yearFounded}
Members: ${formData.members}
About: ${formData.about}`);
    // Navigate back to book club details page
    navigate(`/bookclub/${id}`);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <h1>Edit Book Club</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Club Name:
          <input
            type="text"
            name="clubName"
            value={formData.clubName}
            onChange={handleChange}
            required
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </label>
        <label>
          Founder:
          <input
            type="text"
            name="founder"
            value={formData.founder}
            onChange={handleChange}
            required
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </label>
        <label>
          Year Founded:
          <input
            type="text"
            name="yearFounded"
            value={formData.yearFounded}
            onChange={handleChange}
            required
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </label>
        <label>
          Members:
          <input
            type="number"
            name="members"
            value={formData.members}
            onChange={handleChange}
            min="0"
            required
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </label>
        <label>
          About:
          <textarea
            name="about"
            value={formData.about}
            onChange={handleChange}
            rows="8"
            required
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </label>
        <button type="submit" style={{ 
    
           backgroundColor: '#28a745',
           color: 'white',
           border: 'none',
           padding: '10px 20px',
           borderRadius: '4px',
           cursor: 'pointer',
           fontSize: '16px' }}
        >Update</button>
        <button type="button" onClick={() => navigate(`/bookclub/${id}`)}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginLeft: '10px'
          }}>Cancel</button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          type="button"
          onClick={() => navigate(`/bookclub/${id}`)}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Back to Book Club
        </button>
      </div>
    </div>
  );
};

export default EditBookClub;
