import React, { useState } from "react";
import axios from "axios";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    aadhaar: "",
    pan: "",
    applicantName: ""
  });

  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await axios.post(
        "http://localhost:5100/api/v1/registration",
        formData
      );
      if (res.status === 201) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      <h2>Udyam Registration</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Aadhaar Number</label>
          <input
            type="text"
            name="aadhaar"
            value={formData.aadhaar}
            onChange={handleChange}
            required
            pattern="\d{12}"
            title="Enter 12-digit Aadhaar number"
          />
        </div>
        <div>
          <label>PAN Number</label>
          <input
            type="text"
            name="pan"
            value={formData.pan}
            onChange={handleChange}
            required
            pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
            title="Enter valid PAN number"
          />
        </div>
        <div>
          <label>Applicant Name</label>
          <input
            type="text"
            name="applicantName"
            value={formData.applicantName}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>

      {status === "loading" && <p>Submitting...</p>}
      {status === "success" && <p style={{ color: "green" }}>Registration successful!</p>}
      {status === "error" && <p style={{ color: "red" }}>Registration failed!</p>}
    </div>
  );
};

export default RegistrationForm;
