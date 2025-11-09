import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import { FaHome, FaBuilding, FaDoorOpen, FaUsers, FaMoneyBillWave, FaFileInvoiceDollar, FaChartBar } from 'react-icons/fa';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <FaHome /> },
    { path: '/buildings', label: 'Buildings', icon: <FaBuilding /> },
    { path: '/flats', label: 'Flats', icon: <FaDoorOpen /> },
    { path: '/tenants', label: 'Tenants', icon: <FaUsers /> },
    { path: '/payments', label: 'Payments', icon: <FaMoneyBillWave /> },
    { path: '/payment-entry', label: 'Payment Entry', icon: <FaMoneyBillWave /> },
    { path: '/expenses', label: 'Expenses', icon: <FaFileInvoiceDollar /> },
    { path: '/reports', label: 'Reports', icon: <FaChartBar /> },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <FaBuilding className="brand-icon" />
          <span>Flat Management</span>
        </Link>
        <ul className="navbar-menu">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`navbar-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
