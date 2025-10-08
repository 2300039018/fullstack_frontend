import { useState, useEffect } from "react";
import "../pagescss/employeepage.css";

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [leaveRequest, setLeaveRequest] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    empId: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const empId = "0423"; // Hardcoded for now, replace with auth context or localStorage

  useEffect(() => {
    const fetchLeaveHistory = async () => {
      try {
        const res = await fetch(`http://localhost:8090/api/employees/leaves?empId=${empId}`);
        if (!res.ok) throw new Error("Failed to fetch leave history");
        const data = await res.json();
        setLeaveHistory(data);
      } catch (error) {
        console.error("Error fetching leave history:", error);
        // Removed alert pop-up
      }
    };

    const fetchPayrollHistory = async () => {
      try {
        const res = await fetch(`http://localhost:8090/api/employees/payroll?empId=${empId}`);
        if (!res.ok) throw new Error("Failed to fetch payroll history");
        const data = await res.json();
        setPayrollHistory(data);
      } catch (error) {
        console.error("Error fetching payroll history:", error);
        // Removed alert pop-up
      }
    };

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:8090/api/employees/profile?empId=${empId}`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setPersonalInfo({
          name: data.name,
          email: data.email,
          phone: data.mobile,
          username: data.username,
          empId: data.empId,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Removed alert pop-up
      }
    };

    fetchLeaveHistory();
    fetchPayrollHistory();
    fetchProfile();
  }, [empId]);

  const handleLeaveInputChange = (e) => {
    const { name, value } = e.target;
    setLeaveRequest({ ...leaveRequest, [name]: value });
  };

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo({ ...personalInfo, [name]: value });
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8090/api/employees/leave-request?empId=${empId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: leaveRequest.type,
          startDate: leaveRequest.startDate,
          endDate: leaveRequest.endDate,
          reason: leaveRequest.reason,
        }),
      });
      if (response.ok) {
        const newLeaveRequest = await response.json();
        setLeaveHistory([...leaveHistory, newLeaveRequest]);
        setLeaveRequest({ type: "", startDate: "", endDate: "", reason: "" });
        alert("Leave request submitted successfully!"); // Kept this success alert
      } else {
        const errorData = await response.json();
        console.error("Failed to submit leave request:", errorData.message || "Unknown error");
        // Removed alert pop-up for failure
      }
    } catch (error) {
      console.error("Error:", error);
      // Removed alert pop-up
    }
  };

  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8090/api/employees/profile?empId=${empId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: personalInfo.name,
          email: personalInfo.email,
          mobile: personalInfo.phone,
        }),
      });
      if (response.ok) {
        setIsEditing(false);
        alert("Personal information updated successfully!"); // Kept this success alert
      } else {
        const errorData = await response.json();
        console.error("Failed to update profile:", errorData.message || "Unknown error");
        // Removed alert pop-up for failure
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      // Removed alert pop-up
    }
  };

  return (
    <div className="employee-dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <i className="fas fa-user"></i>
          <h2>Employee Portal</h2>
        </div>
        <ul className="sidebar-menu">
          <li className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>
            <i className="fas fa-th-large"></i> Dashboard
          </li>
          <li className={activeTab === "leaves" ? "active" : ""} onClick={() => setActiveTab("leaves")}>
            <i className="fas fa-calendar-day"></i> Leave Management
          </li>
          <li className={activeTab === "payroll" ? "active" : ""} onClick={() => setActiveTab("payroll")}>
            <i className="fas fa-money-bill-wave"></i> Payroll
          </li>
          <li className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>
            <i className="fas fa-user-cog"></i> Profile
          </li>
        </ul>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <i className="fas fa-user"></i>
            </div>
            <div className="user-details">
              <h4>StaticUser</h4> {/* Static username */}
              <p>Employee</p> {/* Static role/title */}
            </div>
          </div>
          <button className="logout-btn" onClick={() => window.location.href = "/"}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="content-header">
          <h1>
            {activeTab === "dashboard" && "Employee Dashboard"}
            {activeTab === "leaves" && "Leave Management"}
            {activeTab === "payroll" && "Payroll Information"}
            {activeTab === "profile" && "Personal Profile"}
          </h1>
          <div className="header-actions">
            <div className="notifications">
              <i className="fas fa-bell"></i>
              <span className="badge">2</span>
            </div>
          </div>
        </div>

        {activeTab === "dashboard" && (
          <div className="dashboard-content">
            <div className="welcome-card">
              <h2>Welcome, {personalInfo.username || "Loading..."}!</h2>
              <p>Here's a quick overview of your information</p>
            </div>

            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="stat-info">
                  <h3>12</h3>
                  <p>Leave Days Available</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-calendar-times"></i>
                </div>
                <div className="stat-info">
                  <h3>{leaveHistory.filter((leave) => leave.status === "Pending").length}</h3>
                  <p>Pending Leave Requests</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-money-bill-wave"></i>
                </div>
                <div className="stat-info">
                  <h3>$5,000</h3>
                  <p>Current Salary</p>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="action-buttons">
                <button className="action-btn" onClick={() => setActiveTab("leaves")}>
                  <i className="fas fa-calendar-plus"></i>
                  <span>Apply for Leave</span>
                </button>
                <button className="action-btn" onClick={() => setActiveTab("payroll")}>
                  <i className="fas fa-file-invoice-dollar"></i>
                  <span>View Payslips</span>
                </button>
                <button className="action-btn" onClick={() => setActiveTab("profile")}>
                  <i className="fas fa-user-edit"></i>
                  <span>Update Profile</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "leaves" && (
          <div className="leave-content">
            <div className="content-section">
              <h2>Apply for Leave</h2>
              <form onSubmit={handleLeaveSubmit} className="leave-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Leave Type</label>
                    <select name="type" value={leaveRequest.type} onChange={handleLeaveInputChange} required>
                      <option value="">Select Leave Type</option>
                      <option value="Vacation">Vacation</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Personal">Personal</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={leaveRequest.startDate}
                      onChange={handleLeaveInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={leaveRequest.endDate}
                      onChange={handleLeaveInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Reason</label>
                    <textarea
                      name="reason"
                      value={leaveRequest.reason}
                      onChange={handleLeaveInputChange}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="submit-btn">Submit Leave Request</button>
              </form>
            </div>

            <div className="content-section">
              <h2>Leave History</h2>
              <div className="leave-history">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Reason</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveHistory.map((leave) => (
                      <tr key={leave.id}>
                        <td>{leave.type}</td>
                        <td>{leave.startDate}</td>
                        <td>{leave.endDate}</td>
                        <td>{leave.reason}</td>
                        <td>
                          <span className={`status-badge ${leave.status.toLowerCase()}`}>
                            {leave.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "payroll" && (
          <div className="payroll-content">
            <div className="content-section">
              <h2>Payroll History</h2>
              <div className="payroll-history">
                <table>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Salary</th>
                      <th>Status</th>
                      <th>Payslip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollHistory.map((payroll) => (
                      <tr key={payroll.id}>
                        <td>{payroll.month}</td>
                        <td>{payroll.salary}</td>
                        <td>
                          <span className={`status-badge ${payroll.status.toLowerCase()}`}>
                            {payroll.status}
                          </span>
                        </td>
                        <td>
                          <button className="view-btn">
                            <i className="fas fa-download"></i> Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="profile-content">
            <div className="content-section">
              <h2>Personal Information</h2>
              <form onSubmit={handlePersonalInfoSubmit} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={personalInfo.name}
                      onChange={handlePersonalInfoChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={personalInfo.email}
                      onChange={handlePersonalInfoChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={personalInfo.phone}
                      onChange={handlePersonalInfoChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                {isEditing ? (
                  <div className="form-actions">
                    <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                    <button type="submit">Save Changes</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setIsEditing(true)} className="edit-btn">
                    <i className="fas fa-edit"></i> Edit Information
                  </button>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;