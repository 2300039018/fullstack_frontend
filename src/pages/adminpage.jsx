import { useState, useEffect } from "react";
import "../pagescss/adminpage.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [employees, setEmployees] = useState([]);
  const [hrAccounts, setHrAccounts] = useState([]);
  const [signupRequests, setSignupRequests] = useState([]);
  const [requestFilter, setRequestFilter] = useState({ role: "all", department: "all" });
  const [employeeFilter, setEmployeeFilter] = useState({ department: "all", status: "all" });
  const [hrFilter, setHrFilter] = useState({ status: "all" });
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddHr, setShowAddHr] = useState(false);
  const [showEditEmployee, setShowEditEmployee] = useState(false);
  const [showEditHr, setShowEditHr] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    mobile: "",
    gender: "",
    department: "",
    position: "",
    joinDate: "",
    role: "employee",
  });

  const [newHr, setNewHr] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    mobile: "",
    gender: "",
    department: "HR",
    position: "",
    joinDate: "",
    role: "hr",
  });

  const [editEmployee, setEditEmployee] = useState({
    id: "",
    name: "",
    username: "",
    password: "",
    email: "",
    mobile: "",
    gender: "",
    department: "",
    position: "",
    joinDate: "",
    status: "",
  });

  const [editHr, setEditHr] = useState({
    id: "",
    name: "",
    username: "",
    password: "",
    email: "",
    mobile: "",
    gender: "",
    department: "HR",
    position: "",
    joinDate: "",
    status: "",
  });

  // Fetch data on mount
  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://localhost:8090/api/employees");
      if (!res.ok) throw new Error("Failed to fetch employees");
      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      alert("Error fetching employees: " + error.message);
    }
  };

  const fetchHrAccounts = async () => {
    try {
      const res = await fetch("http://localhost:8090/api/hr/accounts");
      if (!res.ok) throw new Error("Failed to fetch HR accounts");
      const data = await res.json();
      setHrAccounts(data);
    } catch (error) {
      console.error("Error fetching HR accounts:", error);
      alert("Error fetching HR accounts: " + error.message);
    }
  };

  const fetchSignupRequests = async () => {
    try {
      const empRes = await fetch("http://localhost:8090/api/employees/pending");
      if (!empRes.ok) throw new Error("Failed to fetch pending employees");
      const empData = await empRes.json();

      const hrRes = await fetch("http://localhost:8090/api/hr/pending");
      if (!hrRes.ok) throw new Error("Failed to fetch pending HR");
      const hrData = await hrRes.json();

      const combined = [
        ...empData.map((e) => ({ ...e, role: "employee" })),
        ...hrData.map((h) => ({ ...h, role: "hr" })),
      ];
      setSignupRequests(combined);
    } catch (error) {
      console.error("Error fetching signup requests:", error);
      alert("Error fetching signup requests: " + error.message);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchHrAccounts();
    fetchSignupRequests();
  }, []);

  // Stats
  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter((emp) => emp.status === "approved").length,
    onLeave: employees.filter((emp) => emp.status === "on_leave").length,
    departments: [...new Set(employees.map((emp) => emp.department))].length,
    hrAccounts: hrAccounts.length,
    pendingRequests: signupRequests.length,
  };

  // Filter functions
  const filterRequests = () => {
    return signupRequests.filter((request) => {
      if (requestFilter.role !== "all" && request.role !== requestFilter.role) return false;
      if (requestFilter.department !== "all" && request.department !== requestFilter.department) return false;
      return true;
    });
  };

  const filterEmployees = () => {
    return employees.filter((emp) => {
      if (employeeFilter.department !== "all" && emp.department !== employeeFilter.department) return false;
      if (employeeFilter.status !== "all" && emp.status !== employeeFilter.status) return false;
      return true;
    });
  };

  const filterHrAccounts = () => {
    return hrAccounts.filter((hr) => {
      if (hrFilter.status !== "all" && hr.status !== hrFilter.status) return false;
      return true;
    });
  };

  // Handle input changes
  const handleEmployeeInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee({ ...newEmployee, [name]: value });
  };

  const handleHrInputChange = (e) => {
    const { name, value } = e.target;
    setNewHr({ ...newHr, [name]: value });
  };

  const handleEditEmployeeInputChange = (e) => {
    const { name, value } = e.target;
    setEditEmployee({ ...editEmployee, [name]: value });
  };

  const handleEditHrInputChange = (e) => {
    const { name, value } = e.target;
    setEditHr({ ...editHr, [name]: value });
  };

  // Add employee
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8090/api/employees/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmployee),
      });
      if (!response.ok) throw new Error("Failed to create employee");
      const data = await response.json();
      const approveRes = await fetch(`http://localhost:8090/api/employees/approve/${data.id}`, { method: "POST" });
      if (!approveRes.ok) throw new Error("Failed to approve employee");
      fetchEmployees();
      fetchSignupRequests();
      setShowAddEmployee(false);
      setNewEmployee({
        name: "",
        username: "",
        password: "",
        email: "",
        mobile: "",
        gender: "",
        department: "",
        position: "",
        joinDate: "",
        role: "employee",
      });
      alert("Employee added and approved successfully!");
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("Error adding employee: " + error.message);
    }
  };

  // Add HR
  const handleAddHr = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8090/api/hr/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHr),
      });
      if (!response.ok) throw new Error("Failed to create HR");
      const data = await response.json();
      const approveRes = await fetch(`http://localhost:8090/api/hr/approve/${data.id}`, { method: "POST" });
      if (!approveRes.ok) throw new Error("Failed to approve HR");
      fetchHrAccounts();
      fetchSignupRequests();
      setShowAddHr(false);
      setNewHr({
        name: "",
        username: "",
        password: "",
        email: "",
        mobile: "",
        gender: "",
        department: "HR",
        position: "",
        joinDate: "",
        role: "hr",
      });
      alert("HR added and approved successfully!");
    } catch (error) {
      console.error("Error adding HR:", error);
      alert("Error adding HR: " + error.message);
    }
  };

  // Edit employee
  const handleEditEmployee = (employee) => {
    setEditEmployee({
      id: employee.id,
      name: employee.name,
      username: employee.username,
      password: employee.password,
      email: employee.email,
      mobile: employee.mobile,
      gender: employee.gender,
      department: employee.department,
      position: employee.position || "",
      joinDate: employee.joinDate,
      status: employee.status,
    });
    setShowEditEmployee(true);
  };

  // Edit HR
  const handleEditHr = (hr) => {
    setEditHr({
      id: hr.id,
      name: hr.name,
      username: hr.username,
      password: hr.password,
      email: hr.email,
      mobile: hr.mobile,
      gender: hr.gender,
      department: hr.department,
      position: hr.position || "",
      joinDate: hr.joinDate,
      status: hr.status,
    });
    setShowEditHr(true);
  };

  // Update employee
  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8090/api/employees/${editEmployee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editEmployee),
      });
      if (!response.ok) throw new Error("Failed to update employee");
      fetchEmployees();
      setShowEditEmployee(false);
      alert("Employee updated successfully!");
    } catch (error) {
      console.error("Error updating employee:", error);
      alert("Error updating employee: " + error.message);
    }
  };

  // Update HR
  const handleUpdateHr = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8090/api/hr/${editHr.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editHr),
      });
      if (!response.ok) throw new Error("Failed to update HR");
      fetchHrAccounts();
      setShowEditHr(false);
      alert("HR updated successfully!");
    } catch (error) {
      console.error("Error updating HR:", error);
      alert("Error updating HR: " + error.message);
    }
  };

  // Delete employee
  const handleDeleteEmployee = async (id) => {
    try {
      const response = await fetch(`http://localhost:8090/api/employees/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete employee");
      fetchEmployees();
      alert("Employee deleted successfully!");
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Error deleting employee: " + error.message);
    }
  };

  // Delete HR
  const handleDeleteHr = async (id) => {
    try {
      const response = await fetch(`http://localhost:8090/api/hr/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete HR");
      fetchHrAccounts();
      alert("HR deleted successfully!");
    } catch (error) {
      console.error("Error deleting HR:", error);
      alert("Error deleting HR: " + error.message);
    }
  };

  // Approve signup request
  const handleApproveRequest = async (request) => {
    try {
      let url = "";
      if (request.role === "employee") {
        url = `http://localhost:8090/api/employees/approve/${request.id}`;
      } else {
        url = `http://localhost:8090/api/hr/approve/${request.id}`;
      }
      const response = await fetch(url, { method: "POST" });
      if (!response.ok) throw new Error("Failed to approve request");
      fetchSignupRequests();
      fetchEmployees();
      fetchHrAccounts();
      alert("Request approved successfully!");
    } catch (error) {
      console.error("Error approving request:", error);
      alert("Error approving request: " + error.message);
    }
  };

  // Reject signup request
  const handleRejectRequest = async (request) => {
    try {
      let url = "";
      if (request.role === "employee") {
        url = `http://localhost:8090/api/employees/reject/${request.id}`;
      } else {
        url = `http://localhost:8090/api/hr/reject/${request.id}`;
      }
      const response = await fetch(url, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to reject request");
      fetchSignupRequests();
      alert("Request rejected successfully!");
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Error rejecting request: " + error.message);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <i className="fas fa-users-cog"></i>
          <h2>Admin Panel</h2>
        </div>
        <ul className="sidebar-menu">
          <li className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>
            <i className="fas fa-th-large"></i> Dashboard
          </li>
          <li className={activeTab === "requests" ? "active" : ""} onClick={() => setActiveTab("requests")}>
            <i className="fas fa-user-clock"></i> Signup Requests
            {stats.pendingRequests > 0 && <span className="request-badge">{stats.pendingRequests}</span>}
          </li>
          <li className={activeTab === "employees" ? "active" : ""} onClick={() => setActiveTab("employees")}>
            <i className="fas fa-users"></i> Employees
          </li>
          <li className={activeTab === "hr" ? "active" : ""} onClick={() => setActiveTab("hr")}>
            <i className="fas fa-user-tie"></i> HR Accounts
          </li>
          <li className={activeTab === "payroll" ? "active" : ""} onClick={() => setActiveTab("payroll")}>
            <i className="fas fa-money-bill-wave"></i> Payroll
          </li>
          <li className={activeTab === "reports" ? "active" : ""} onClick={() => setActiveTab("reports")}>
            <i className="fas fa-chart-bar"></i> Reports
          </li>
        </ul>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <i className="fas fa-user-shield"></i>
            </div>
            <div className="user-details">
              <h4>Admin User</h4>
              <p>System Administrator</p>
            </div>
          </div>
          <button className="logout-btn" onClick={() => window.location.href = "/"}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-header">
          <h1>
            {activeTab === "dashboard" && "Dashboard"}
            {activeTab === "requests" && "Signup Requests"}
            {activeTab === "employees" && "Employee Management"}
            {activeTab === "hr" && "HR Accounts Management"}
            {activeTab === "payroll" && "Payroll Management"}
            {activeTab === "reports" && "Reports & Analytics"}
          </h1>
          <div className="header-actions">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Search..." />
            </div>
            <div className="notifications">
              <i className="fas fa-bell"></i>
              <span className="badge">3</span>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        {activeTab === "dashboard" && (
          <div className="dashboard-content">
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-info">
                  <h3>{stats.totalEmployees}</h3>
                  <p>Total Employees</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-user-check"></i>
                </div>
                <div className="stat-info">
                  <h3>{stats.activeEmployees}</h3>
                  <p>Active Employees</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-calendar-minus"></i>
                </div>
                <div className="stat-info">
                  <h3>{stats.onLeave}</h3>
                  <p>On Leave</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-building"></i>
                </div>
                <div className="stat-info">
                  <h3>{stats.departments}</h3>
                  <p>Departments</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-user-tie"></i>
                </div>
                <div className="stat-info">
                  <h3>{stats.hrAccounts}</h3>
                  <p>HR Accounts</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-user-clock"></i>
                </div>
                <div className="stat-info">
                  <h3>{stats.pendingRequests}</h3>
                  <p>Pending Requests</p>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="action-buttons">
                <button className="action-btn" onClick={() => setActiveTab("employees")}>
                  <i className="fas fa-user-plus"></i>
                  <span>Add Employee</span>
                </button>
                <button className="action-btn" onClick={() => setActiveTab("hr")}>
                  <i className="fas fa-user-plus"></i>
                  <span>Add HR Account</span>
                </button>
                <button className="action-btn" onClick={() => setActiveTab("requests")}>
                  <i className="fas fa-user-check"></i>
                  <span>Review Requests</span>
                </button>
                <button className="action-btn">
                  <i className="fas fa-file-export"></i>
                  <span>Generate Report</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Signup Requests */}
        {activeTab === "requests" && (
          <div className="employees-content">
            <div className="content-header">
              <h2>Pending Signup Requests</h2>
            </div>

            <div className="filter-section">
              <h3>Filter Requests</h3>
              <div className="filter-controls">
                <div className="filter-group">
                  <label>Role:</label>
                  <select
                    value={requestFilter.role}
                    onChange={(e) => setRequestFilter({ ...requestFilter, role: e.target.value })}
                  >
                    <option value="all">All Roles</option>
                    <option value="employee">Employee</option>
                    <option value="hr">HR</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Department:</label>
                  <select
                    value={requestFilter.department}
                    onChange={(e) => setRequestFilter({ ...requestFilter, department: e.target.value })}
                  >
                    <option value="all">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="HR">Human Resources</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="employees-table">
              {filterRequests().length === 0 ? (
                <p className="no-requests">No pending signup requests</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Gender</th>
                      <th>Department</th>
                      <th>Position</th>
                      <th>Role</th>
                      <th>Requested At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterRequests().map((request) => (
                      <tr key={request.id}>
                        <td>{request.id}</td>
                        <td>{request.name}</td>
                        <td>{request.username}</td>
                        <td>{request.email}</td>
                        <td>{request.mobile}</td>
                        <td>{request.gender}</td>
                        <td>{request.department}</td>
                        <td>{request.position}</td>
                        <td>
                          <span className={`role-badge ${request.role}`}>
                            {request.role.toUpperCase()}
                          </span>
                        </td>
                        <td>{request.joinDate}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-btn approve"
                              title="Approve"
                              onClick={() => handleApproveRequest(request)}
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              className="action-btn reject"
                              title="Reject"
                              onClick={() => handleRejectRequest(request)}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Employees Management */}
        {activeTab === "employees" && (
          <div className="employees-content">
            <div className="content-header">
              <h2>Employee Directory</h2>
              <button className="add-employee-btn" onClick={() => setShowAddEmployee(true)}>
                <i className="fas fa-plus"></i> Add Employee
              </button>
            </div>

            <div className="filter-section">
              <h3>Filter Employees</h3>
              <div className="filter-controls">
                <div className="filter-group">
                  <label>Department:</label>
                  <select
                    value={employeeFilter.department}
                    onChange={(e) => setEmployeeFilter({ ...employeeFilter, department: e.target.value })}
                  >
                    <option value="all">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="HR">Human Resources</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Status:</label>
                  <select
                    value={employeeFilter.status}
                    onChange={(e) => setEmployeeFilter({ ...employeeFilter, status: e.target.value })}
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {showAddEmployee && (
              <div className="add-employee-form">
                <h3>Add New Employee</h3>
                <form onSubmit={handleAddEmployee}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={newEmployee.name}
                        onChange={handleEmployeeInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Username</label>
                      <input
                        type="text"
                        name="username"
                        value={newEmployee.username}
                        onChange={handleEmployeeInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        name="password"
                        value={newEmployee.password}
                        onChange={handleEmployeeInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={newEmployee.email}
                        onChange={handleEmployeeInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Mobile</label>
                      <input
                        type="text"
                        name="mobile"
                        value={newEmployee.mobile}
                        onChange={handleEmployeeInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select
                        name="gender"
                        value={newEmployee.gender}
                        onChange={handleEmployeeInputChange}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Department</label>
                      <select
                        name="department"
                        value={newEmployee.department}
                        onChange={handleEmployeeInputChange}
                        required
                      >
                        <option value="">Select Department</option>
                        <option value="Engineering">Engineering</option>
                        <option value="HR">Human Resources</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Finance">Finance</option>
                        <option value="Operations">Operations</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Position</label>
                      <input
                        type="text"
                        name="position"
                        value={newEmployee.position}
                        onChange={handleEmployeeInputChange}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Join Date</label>
                      <input
                        type="date"
                        name="joinDate"
                        value={newEmployee.joinDate}
                        onChange={handleEmployeeInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowAddEmployee(false)}>
                      Cancel
                    </button>
                    <button type="submit">Add Employee</button>
                  </div>
                </form>
              </div>
            )}

            {showEditEmployee && (
              <div className="add-employee-form">
                <h3>Edit Employee</h3>
                <form onSubmit={handleUpdateEmployee}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={editEmployee.name}
                        onChange={handleEditEmployeeInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Username</label>
                      <input
                        type="text"
                        name="username"
                        value={editEmployee.username}
                        onChange={handleEditEmployeeInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        name="password"
                        value={editEmployee.password}
                        onChange={handleEditEmployeeInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={editEmployee.email}
                        onChange={handleEditEmployeeInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Mobile</label>
                      <input
                        type="text"
                        name="mobile"
                        value={editEmployee.mobile}
                        onChange={handleEditEmployeeInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select
                        name="gender"
                        value={editEmployee.gender}
                        onChange={handleEditEmployeeInputChange}
                        required
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Department</label>
                      <select
                        name="department"
                        value={editEmployee.department}
                        onChange={handleEditEmployeeInputChange}
                        required
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="HR">Human Resources</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Finance">Finance</option>
                        <option value="Operations">Operations</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Position</label>
                      <input
                        type="text"
                        name="position"
                        value={editEmployee.position}
                        onChange={handleEditEmployeeInputChange}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Join Date</label>
                      <input
                        type="date"
                        name="joinDate"
                        value={editEmployee.joinDate}
                        onChange={handleEditEmployeeInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        name="status"
                        value={editEmployee.status}
                        onChange={handleEditEmployeeInputChange}
                        required
                      >
                        <option value="approved">Active</option>
                        <option value="on_leave">On Leave</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowEditEmployee(false)}>
                      Cancel
                    </button>
                    <button type="submit">Update Employee</button>
                  </div>
                </form>
              </div>
            )}

            <div className="employees-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Gender</th>
                    <th>Department</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Join Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filterEmployees().map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.id}</td>
                      <td>{employee.empId}</td>
                      <td>{employee.name}</td>
                      <td>{employee.username}</td>
                      <td>{employee.email}</td>
                      <td>{employee.mobile}</td>
                      <td>{employee.gender}</td>
                      <td>{employee.department}</td>
                      <td>{employee.position}</td>
                      <td>
                        <span className={`status-badge ${employee.status}`}>
                          {employee.status === "approved"
                            ? "Active"
                            : employee.status.charAt(0).toUpperCase() +
                              employee.status.slice(1).replace("_", " ")}
                        </span>
                      </td>
                      <td>{employee.joinDate}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn edit"
                            title="Edit"
                            onClick={() => handleEditEmployee(employee)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="action-btn delete"
                            title="Delete"
                            onClick={() => handleDeleteEmployee(employee.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* HR Accounts Management */}
        {activeTab === "hr" && (
          <div className="employees-content">
            <div className="content-header">
              <h2>HR Accounts Management</h2>
              <button className="add-employee-btn" onClick={() => setShowAddHr(true)}>
                <i className="fas fa-plus"></i> Add HR Account
              </button>
            </div>

            <div className="filter-section">
              <h3>Filter HR Accounts</h3>
              <div className="filter-controls">
                <div className="filter-group">
                  <label>Status:</label>
                  <select
                    value={hrFilter.status}
                    onChange={(e) => setHrFilter({ ...hrFilter, status: e.target.value })}
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {showAddHr && (
              <div className="add-employee-form">
                <h3>Add New HR Account</h3>
                <form onSubmit={handleAddHr}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={newHr.name}
                        onChange={handleHrInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Username</label>
                      <input
                        type="text"
                        name="username"
                        value={newHr.username}
                        onChange={handleHrInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        name="password"
                        value={newHr.password}
                        onChange={handleHrInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={newHr.email}
                        onChange={handleHrInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Mobile</label>
                      <input
                        type="text"
                        name="mobile"
                        value={newHr.mobile}
                        onChange={handleHrInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select
                        name="gender"
                        value={newHr.gender}
                        onChange={handleHrInputChange}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Position</label>
                      <input
                        type="text"
                        name="position"
                        value={newHr.position}
                        onChange={handleHrInputChange}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Join Date</label>
                      <input
                        type="date"
                        name="joinDate"
                        value={newHr.joinDate}
                        onChange={handleHrInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowAddHr(false)}>
                      Cancel
                    </button>
                    <button type="submit">Add HR Account</button>
                  </div>
                </form>
              </div>
            )}

            {showEditHr && (
              <div className="add-employee-form">
                <h3>Edit HR Account</h3>
                <form onSubmit={handleUpdateHr}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={editHr.name}
                        onChange={handleEditHrInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Username</label>
                      <input
                        type="text"
                        name="username"
                        value={editHr.username}
                        onChange={handleEditHrInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        name="password"
                        value={editHr.password}
                        onChange={handleEditHrInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={editHr.email}
                        onChange={handleEditHrInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Mobile</label>
                      <input
                        type="text"
                        name="mobile"
                        value={editHr.mobile}
                        onChange={handleEditHrInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select
                        name="gender"
                        value={editHr.gender}
                        onChange={handleEditHrInputChange}
                        required
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Position</label>
                      <input
                        type="text"
                        name="position"
                        value={editHr.position}
                        onChange={handleEditHrInputChange}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Join Date</label>
                      <input
                        type="date"
                        name="joinDate"
                        value={editHr.joinDate}
                        onChange={handleEditHrInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        name="status"
                        value={editHr.status}
                        onChange={handleEditHrInputChange}
                        required
                      >
                        <option value="approved">Active</option>
                        <option value="on_leave">On Leave</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowEditHr(false)}>
                      Cancel
                    </button>
                    <button type="submit">Update HR Account</button>
                  </div>
                </form>
              </div>
            )}

            <div className="employees-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>HR ID</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Gender</th>
                    <th>Department</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Join Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filterHrAccounts().map((hr) => (
                    <tr key={hr.id}>
                      <td>{hr.id}</td>
                      <td>{hr.hrId}</td>
                      <td>{hr.name}</td>
                      <td>{hr.username}</td>
                      <td>{hr.email}</td>
                      <td>{hr.mobile}</td>
                      <td>{hr.gender}</td>
                      <td>{hr.department}</td>
                      <td>{hr.position}</td>
                      <td>
                        <span className={`status-badge ${hr.status}`}>
                          {hr.status === "approved"
                            ? "Active"
                            : hr.status.charAt(0).toUpperCase() + hr.status.slice(1).replace("_", " ")}
                        </span>
                      </td>
                      <td>{hr.joinDate}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn edit"
                            title="Edit"
                            onClick={() => handleEditHr(hr)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="action-btn delete"
                            title="Delete"
                            onClick={() => handleDeleteHr(hr.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;