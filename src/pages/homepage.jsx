import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../pagescss/homepage.css";
import AdminPage from "./adminpage";

const HomePage = () => {
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "", role: "employee" });
  const [signupData, setSignupData] = useState({
    role: "employee",
    username: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    department: "",
    hrPosition: "",
  });
  const [errors, setErrors] = useState({});
  const [signupErrors, setSignupErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8080/api/admins")
      .then((res) => res.json())
      .then((data) => console.log("Admin data:", data))
      .catch((err) => console.error(err));
  }, []);

  // Input handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSignupInputChange = (e) => {
    const { name, value } = e.target;
    setSignupData({ ...signupData, [name]: value });
    if (signupErrors[name]) setSignupErrors({ ...signupErrors, [name]: "" });
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!credentials.email.trim()) newErrors.email = "Email is required";
    if (!credentials.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignupForm = () => {
    const newErrors = {};
    if (!signupData.username.trim()) newErrors.username = "Username is required";
    if (!signupData.email.trim()) newErrors.email = "Email is required";
    if (!signupData.password) newErrors.password = "Password is required";
    if (signupData.role === "employee") {
      if (!signupData.phone) newErrors.phone = "Phone is required";
      if (!signupData.address) newErrors.address = "Address is required";
      if (!signupData.department) newErrors.department = "Department is required";
    } else if (signupData.role === "hr") {
      if (!signupData.hrPosition) newErrors.hrPosition = "HR Position is required";
    }
    setSignupErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    const loginPayload = {
      email: credentials.email,
      password: credentials.password
    };

    let url = "";
    if (credentials.role === "admin") {
      url = "http://localhost:8080/api/admins/login";
    } else if (credentials.role === "employee") {
      url = "http://localhost:8080/api/employees/login";
    } else if (credentials.role === "hr") {
      url = "http://localhost:8080/api/hr/login";
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginPayload),
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        if (credentials.role === "admin") {
          localStorage.setItem("adminUser", JSON.stringify(data));
          setIsLoggedIn(true);
        } else if (credentials.role === "hr") {
          navigate("/hr-dashboard");
        } else {
          navigate("/employee-dashboard");
        }
      } else {
        alert(data.message || "Login failed - check credentials or approval status");
      }
    } catch (err) {
      setIsLoading(false);
      console.error(err);
      alert("Something went wrong. Check backend logs or network.");
    }
  };

  if (isLoggedIn) return <AdminPage />;

  // Signup
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateSignupForm()) return;
    setIsSignupLoading(true);

    let url = "";
    let payload = {
      username: signupData.username,
      email: signupData.email,
      password: signupData.password
    };

    if (signupData.role === "admin") {
      url = "http://localhost:8080/api/admins/create";
    } else if (signupData.role === "employee") {
      url = "http://localhost:8080/api/employees/create";
      payload.phone = signupData.phone;
      payload.address = signupData.address;
      payload.department = signupData.department;
    } else if (signupData.role === "hr") {
      url = "http://localhost:8080/api/hr/create";
      payload.hrPosition = signupData.hrPosition;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      setIsSignupLoading(false);

      if (response.ok) {
        if (signupData.role === "admin") {
          alert("Admin account created successfully!");
          closeSignup();
          setIsLoginOpen(true);
          setCredentials({
            email: signupData.email,
            password: signupData.password,
            role: "admin"
          });
        } else {
          alert("Signup request sent! Wait for admin approval. You'll receive your ID via SMS.");
          closeSignup();
        }
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (err) {
      setIsSignupLoading(false);
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
  };

  // Open/Close popups
  const openLogin = () => { setIsLoginOpen(true); setIsSignupOpen(false); };
  const openSignup = () => { setIsSignupOpen(true); setIsLoginOpen(false); };
  const closeLogin = () => { 
    setIsLoginOpen(false); 
    setCredentials({ email: "", password: "", role: "employee" }); 
    setErrors({}); 
  };
  const closeSignup = () => { 
    setIsSignupOpen(false); 
    setSignupData({ 
      role: "employee", 
      username: "", 
      email: "", 
      password: "", 
      phone: "", 
      address: "", 
      department: "", 
      hrPosition: "" 
    }); 
    setSignupErrors({}); 
  };

  return (
    <div className="home-wrapper">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <i className="fas fa-laptop-code"></i>
            <span>TechSolutions Inc.</span>
          </div>
          <nav className="navigation">
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><button className="login-btn-nav" onClick={openLogin}>Login</button></li>
              <li><button className="signup-btn-nav" onClick={openSignup}>Sign Up</button></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Innovative IT Solutions for Your Business</h1>
            <p>We provide cutting-edge technology services to help your business thrive in the digital age</p>
            <div className="hero-buttons">
              <button className="cta-button primary" onClick={openSignup}>Get Started</button>
              <button className="cta-button secondary" onClick={openLogin}>Employee Login</button>
            </div>
          </div>
          <div className="hero-image">
            <img src="https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="IT Solutions" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="container">
          <h2>Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon"><i className="fas fa-code"></i></div>
              <h3>Web Development</h3>
              <p>Custom web applications and responsive websites built with the latest technologies</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><i className="fas fa-cloud"></i></div>
              <h3>Cloud Solutions</h3>
              <p>Secure and scalable cloud infrastructure for your business needs</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><i className="fas fa-shield-alt"></i></div>
              <h3>Cyber Security</h3>
              <p>Comprehensive security solutions to protect your digital assets</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><i className="fas fa-mobile-alt"></i></div>
              <h3>Mobile Apps</h3>
              <p>Native and cross-platform mobile applications for iOS and Android</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - FIXED */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item"><h3>250+</h3><p>Projects Completed</p></div>
            <div className="stat-item"><h3>98%</h3><p>Client Satisfaction</p></div>
            <div className="stat-item"><h3>50+</h3><p>IT Professionals</p></div>
            <div className="stat-item"><h3>15+</h3><p>Years Experience</p></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>TechSolutions Inc.</h3>
              <p>Innovative IT solutions for modern businesses. We help you leverage technology for growth.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Contact Us</h4>
              <p><i className="fas fa-map-marker-alt"></i> 123 Tech Street, City</p>
              <p><i className="fas fa-phone"></i> +1 (555) 123-4567</p>
              <p><i className="fas fa-envelope"></i> info@techsolutions.com</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2023 TechSolutions Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* LOGIN POPUP */}
      {isLoginOpen && (
        <div className="login-popup-overlay">
          <div className="login-popup">
            <button className="close-btn" onClick={closeLogin}><i className="fas fa-times"></i></button>
            <div className="login-header">
              <div className="logo"><i className="fas fa-lock"></i></div>
              <h2>Login Portal</h2>
              <p>Welcome back! Please sign in to continue</p>
            </div>
            <form onSubmit={handleLoginSubmit} className="login-form">
              <div className="input-group">
                <label htmlFor="role">Login As</label>
                <div className="input-with-icon">
                  <i className="fas fa-user-tag"></i>
                  <select id="role" name="role" value={credentials.role} onChange={handleInputChange}>
                    <option value="employee">Employee</option>
                    <option value="hr">HR Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <div className="input-with-icon">
                  <i className="fas fa-envelope"></i>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className={errors.email ? "error" : ""}
                  />
                </div>
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="input-with-icon">
                  <i className="fas fa-lock"></i>
                  <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    value={credentials.password} 
                    onChange={handleInputChange} 
                    placeholder="Enter your password" 
                    className={errors.password ? "error" : ""}/>
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>
              <button type="submit" className={`login-btn ${isLoading ? "loading" : ""}`} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Authenticating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i> Login
                  </>
                )}
              </button>
              <div className="signup-link">
                <p>Don't have an account? <button type="button" onClick={openSignup}>Sign up here</button></p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIGNUP POPUP */}
      {isSignupOpen && (
        <div className="login-popup-overlay">
          <div className="login-popup signup-popup">
            <button className="close-btn" onClick={closeSignup}><i className="fas fa-times"></i></button>
            <div className="login-header">
              <div className="logo"><i className="fas fa-user-plus"></i></div>
              <h2>Create Account</h2>
              <p>Join our platform by creating a new account</p>
            </div>
            <form onSubmit={handleSignupSubmit} className="login-form">
              <div className="input-group">
                <label htmlFor="signup-role">Register As</label>
                <div className="input-with-icon">
                  <i className="fas fa-user-tag"></i>
                  <select id="signup-role" name="role" value={signupData.role} onChange={handleSignupInputChange}>
                    <option value="employee">Employee</option>
                    <option value="hr">HR Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label htmlFor="username">Username</label>
                <div className="input-with-icon">
                  <i className="fas fa-user-circle"></i>
                  <input 
                    type="text" 
                    id="username" 
                    name="username" 
                    value={signupData.username} 
                    onChange={handleSignupInputChange} 
                    placeholder="Choose a username" 
                    className={signupErrors.username ? "error" : ""}/>
                </div>
                {signupErrors.username && <span className="error-message">{signupErrors.username}</span>}
              </div>
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <div className="input-with-icon">
                  <i className="fas fa-envelope"></i>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={signupData.email} 
                    onChange={handleSignupInputChange} 
                    placeholder="Enter your email" 
                    className={signupErrors.email ? "error" : ""}/>
                </div>
                {signupErrors.email && <span className="error-message">{signupErrors.email}</span>}
              </div>
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="input-with-icon">
                  <i className="fas fa-lock"></i>
                  <input 
                    type="password" 
                    id="password-signup" 
                    name="password" 
                    value={signupData.password} 
                    onChange={handleSignupInputChange} 
                    placeholder="Enter password" 
                    className={signupErrors.password ? "error" : ""}/>
                </div>
                {signupErrors.password && <span className="error-message">{signupErrors.password}</span>}
              </div>
              {signupData.role === "employee" && (
                <>
                  <div className="input-group">
                    <label htmlFor="phone">Phone</label>
                    <div className="input-with-icon">
                      <i className="fas fa-phone"></i>
                      <input 
                        type="text" 
                        id="phone" 
                        name="phone" 
                        value={signupData.phone} 
                        onChange={handleSignupInputChange} 
                        placeholder="Enter phone number" 
                        className={signupErrors.phone ? "error" : ""}/>
                    </div>
                    {signupErrors.phone && <span className="error-message">{signupErrors.phone}</span>}
                  </div>
                  <div className="input-group">
                    <label htmlFor="address">Address</label>
                    <div className="input-with-icon">
                      <i className="fas fa-map-marker-alt"></i>
                      <input 
                        type="text" 
                        id="address" 
                        name="address" 
                        value={signupData.address} 
                        onChange={handleSignupInputChange} 
                        placeholder="Enter your address" 
                        className={signupErrors.address ? "error" : ""}/>
                    </div>
                    {signupErrors.address && <span className="error-message">{signupErrors.address}</span>}
                  </div>
                  <div className="input-group">
                    <label htmlFor="department">Department</label>
                    <div className="input-with-icon">
                      <i className="fas fa-building"></i>
                      <select 
                        id="department" 
                        name="department" 
                        value={signupData.department} 
                        onChange={handleSignupInputChange} 
                        className={signupErrors.department ? "error" : ""}
                        required
                      >
                        <option value="">Select Department</option>
                        <option value="technical">Technical</option>
                        <option value="sales">Sales</option>
                        <option value="marketing">Marketing</option>
                        <option value="finance">Finance</option>
                      </select>
                    </div>
                    {signupErrors.department && <span className="error-message">{signupErrors.department}</span>}
                  </div>
                </>
              )}
              {signupData.role === "hr" && (
                <div className="input-group">
                  <label htmlFor="hrPosition">HR Position</label>
                  <div className="input-with-icon">
                    <i className="fas fa-user-tie"></i>
                    <select 
                      id="hrPosition" 
                      name="hrPosition" 
                      value={signupData.hrPosition} 
                      onChange={handleSignupInputChange} 
                      className={signupErrors.hrPosition ? "error" : ""}
                      required
                    >
                      <option value="">Select HR Position</option>
                      <option value="technical">Technical</option>
                      <option value="sales">Sales</option>
                      <option value="marketing">Marketing</option>
                      <option value="finance">Finance</option>
                    </select>
                  </div>
                  {signupErrors.hrPosition && <span className="error-message">{signupErrors.hrPosition}</span>}
                </div>
              )}
              <button type="submit" className={`login-btn ${isSignupLoading ? "loading" : ""}`} disabled={isSignupLoading}>
                {isSignupLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus"></i> Sign Up
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;