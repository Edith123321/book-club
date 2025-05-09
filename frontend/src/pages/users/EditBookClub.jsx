import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditBookClub = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch book club data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/bookclubs/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch book club data');
        }
        const data = await response.json();
        setFormData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'members' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/bookclubs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update book club');
      }

      navigate(`http://localhost:5000/bookclub/${id}`);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!formData) return null;


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
