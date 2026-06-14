import React, { useState } from "react";

function RegistrationForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [gender, setGender] = useState("");
  const [year, setYear] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email";
    if (!course.trim()) errs.course = "Course is required";
    if (!gender) errs.gender = "Select a gender";
    if (!year) errs.year = "Select a year";
    if (!phone.trim() || !/^[\d\s()+-]{7,}$/.test(phone)) errs.phone = "Enter a valid phone number";
    if (!age || Number(age) <= 0) errs.age = "Enter a valid age";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setMessage("");
      return;
    }
    setErrors({});
    setMessage(
      `Registration complete!\\nName: ${name}\\nEmail: ${email}\\nCourse: ${course}\\nGender: ${gender}\\nYear: ${year}\\nPhone: ${phone}\\nAge: ${age}`
    );
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Register for a Course</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className={errors.name ? 'input-error' : ''}
              aria-invalid={errors.name ? 'true' : 'false'}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className={errors.email ? 'input-error' : ''}
              aria-invalid={errors.email ? 'true' : 'false'}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="course">Course</label>
            <input
              id="course"
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Enter the course name"
              className={errors.course ? 'input-error' : ''}
              aria-invalid={errors.course ? 'true' : 'false'}
            />
            {errors.course && <div className="error-message">{errors.course}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className={errors.gender ? 'input-error' : ''} aria-invalid={errors.gender ? 'true' : 'false'}>
              <option value="">Select gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            {errors.gender && <div className="error-message">{errors.gender}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="year">Year</label>
            <select id="year" value={year} onChange={(e) => setYear(e.target.value)} className={errors.year ? 'input-error' : ''} aria-invalid={errors.year ? 'true' : 'false'}>
              <option value="">Select year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
              <option value="Other">Other</option>
            </select>
            {errors.year && <div className="error-message">{errors.year}</div>}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 555 555 5555"
                className={errors.phone ? 'input-error' : ''}
                aria-invalid={errors.phone ? 'true' : 'false'}
              />
              {errors.phone && <div className="error-message">{errors.phone}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                id="age"
                type="number"
                min="0"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Your age"
                className={errors.age ? 'input-error' : ''}
                aria-invalid={errors.age ? 'true' : 'false'}
              />
              {errors.age && <div className="error-message">{errors.age}</div>}
            </div>
          </div>

          <button type="submit">Register</button>
        </form>
        {message && <div className="message">{message}</div>}
      </div>
    </div>
  );
}

export default RegistrationForm;
