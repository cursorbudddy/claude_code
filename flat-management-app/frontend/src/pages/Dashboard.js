import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getBuildings, getOverdueSchedules, getLatestRental, getUpcomingPayments, getPayments, getExpenses, getFlats } from '../api';
import { useBuilding } from '../context/BuildingContext';
import BuildingSelector from '../components/BuildingSelector';
import { FaBuilding, FaDoorOpen, FaUsers, FaMoneyBillWave, FaExclamationTriangle, FaPlus, FaList, FaFileContract, FaClock, FaCalendar } from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();
  const { buildings, getEffectiveBuilding, setTabBuilding } = useBuilding();

  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [stats, setStats] = useState(null);
  const [overduePayments, setOverduePayments] = useState([]);
  const [latestRental, setLatestRental] = useState(null);
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flats, setFlats] = useState([]);
  const [showOccupiedTooltip, setShowOccupiedTooltip] = useState(false);
  const [showVacantTooltip, setShowVacantTooltip] = useState(false);

  // Initialize with effective building for dashboard tab
  useEffect(() => {
    const effectiveBuilding = getEffectiveBuilding('dashboard');
    if (effectiveBuilding) {
      setSelectedBuilding(effectiveBuilding);
    } else if (buildings.length > 0) {
      setSelectedBuilding(buildings[0]);
    }
  }, [buildings, getEffectiveBuilding]);

  useEffect(() => {
    if (selectedBuilding || buildings.length > 0) {
      fetchData();
    }
  }, [selectedBuilding]);

  const handleBuildingSelect = (building) => {
    setSelectedBuilding(building);
    setTabBuilding('dashboard', building);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = selectedBuilding ? { building_id: selectedBuilding.id } : {};

      const [
        statsRes,
        overdueRes,
        latestRentalRes,
        upcomingRes,
        paymentsRes,
        expensesRes,
        flatsRes
      ] = await Promise.all([
        getDashboardStats(params),
        getOverdueSchedules(params),
        getLatestRental().catch(() => ({ data: null })),
        getUpcomingPayments({ ...params, limit: 5 }).catch(() => ({ data: [] })),
        getPayments({ ...params, limit: 5 }).catch(() => ({ data: [] })),
        getExpenses({ ...params, limit: 5 }).catch(() => ({ data: [] })),
        getFlats(params).catch(() => ({ data: [] }))
      ]);

      setStats(statsRes.data);
      setOverduePayments(overdueRes.data || []);
      setLatestRental(latestRentalRes.data);
      setUpcomingPayments(upcomingRes.data || []);
      setRecentPayments(paymentsRes.data || []);
      setRecentExpenses(expensesRes.data || []);
      setFlats(flatsRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `OMR ${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading && !stats) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/new-entry')}>
            <FaPlus /> New Tenant Entry
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/flats')}>
            <FaList /> View All Flats
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/rentals')}>
            <FaFileContract /> View Rentals
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/payment-entry')}>
            <FaMoneyBillWave /> Record Payment
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/expenses')}>
            <FaMoneyBillWave /> Record Expense
          </button>
        </div>
      </div>

      {/* Building Selector */}
      <BuildingSelector
        buildings={buildings}
        selectedBuilding={selectedBuilding}
        onSelectBuilding={handleBuildingSelect}
      />

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Flats</div>
          <div className="stat-value">{stats?.total_flats || 0}</div>
        </div>
        <div
          className="stat-card success"
          style={{ position: 'relative', cursor: 'pointer' }}
          onMouseEnter={() => setShowOccupiedTooltip(true)}
          onMouseLeave={() => setShowOccupiedTooltip(false)}
          onClick={() => setShowOccupiedTooltip(!showOccupiedTooltip)}
        >
          <div className="stat-label">Occupied Flats</div>
          <div className="stat-value">{stats?.occupied_flats || 0}</div>
          <div className="stat-subtext">
            {stats?.total_flats > 0 ? ((stats.occupied_flats / stats.total_flats) * 100).toFixed(1) : 0}% occupancy
          </div>
          {showOccupiedTooltip && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              marginTop: '8px',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
              minWidth: '200px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '8px', color: '#333' }}>Occupied Flats:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {flats.filter(f => f.is_occupied).length > 0 ? (
                  flats.filter(f => f.is_occupied).map(flat => (
                    <div key={flat.id} style={{ fontSize: '13px', color: '#666' }}>
                      {flat.building_name} - Flat {flat.flat_number}
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '13px', color: '#999' }}>No occupied flats</div>
                )}
              </div>
            </div>
          )}
        </div>
        <div
          className="stat-card warning"
          style={{ position: 'relative', cursor: 'pointer' }}
          onMouseEnter={() => setShowVacantTooltip(true)}
          onMouseLeave={() => setShowVacantTooltip(false)}
          onClick={() => setShowVacantTooltip(!showVacantTooltip)}
        >
          <div className="stat-label">Vacant Flats</div>
          <div className="stat-value">{stats?.vacant_flats || 0}</div>
          {showVacantTooltip && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              marginTop: '8px',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
              minWidth: '200px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '8px', color: '#333' }}>Vacant Flats:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {flats.filter(f => !f.is_occupied).length > 0 ? (
                  flats.filter(f => !f.is_occupied).map(flat => (
                    <div key={flat.id} style={{ fontSize: '13px', color: '#666' }}>
                      {flat.building_name} - Flat {flat.flat_number}
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '13px', color: '#999' }}>No vacant flats</div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="stat-card info">
          <div className="stat-label">Active Tenants</div>
          <div className="stat-value">{stats?.active_tenants || 0}</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Pending Payments</div>
          <div className="stat-value">{stats?.pending_payments || 0}</div>
        </div>
      </div>

      {/* Latest Rental Agreement */}
      {latestRental && (
        <div className="card" style={{ marginTop: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <h3 className="card-title" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaFileContract /> Latest Rental Agreement (Today)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '16px' }}>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>Tenant</div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>{latestRental.tenant_name}</div>
            </div>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.9', marginBottom: '4px' }}>Building & Flat</div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>{latestRental.building_name} - Flat {latestRental.flat_number}</div>
            </div>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.9', marginBottom: '4px' }}>Contract Number</div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>{latestRental.contract_number}</div>
            </div>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.9', marginBottom: '4px' }}>Rental Amount</div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>{formatCurrency(latestRental.rental_amount)}</div>
            </div>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.9', marginBottom: '4px' }}>Duration</div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>{latestRental.rental_duration} {latestRental.rental_duration_unit}</div>
            </div>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.9', marginBottom: '4px' }}>Start Date</div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>{formatDate(latestRental.start_date)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Income and Expenses Summary */}
      <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginTop: '24px' }}>
        <div className="card">
          <h3 className="card-title">Today's Summary</h3>
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#666' }}>Income:</span>
              <span style={{ fontWeight: '600', color: '#28a745' }}>{formatCurrency(stats?.today_income)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#666' }}>Expenses:</span>
              <span style={{ fontWeight: '600', color: '#dc3545' }}>{formatCurrency(stats?.today_expense)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #ddd' }}>
              <span style={{ fontWeight: '600' }}>Net:</span>
              <span style={{ fontWeight: '700', color: stats?.today_net >= 0 ? '#28a745' : '#dc3545' }}>
                {formatCurrency(stats?.today_net)}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">This Month's Summary</h3>
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#666' }}>Income:</span>
              <span style={{ fontWeight: '600', color: '#28a745' }}>{formatCurrency(stats?.month_income)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#666' }}>Expenses:</span>
              <span style={{ fontWeight: '600', color: '#dc3545' }}>{formatCurrency(stats?.month_expense)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #ddd' }}>
              <span style={{ fontWeight: '600' }}>Net:</span>
              <span style={{ fontWeight: '700', color: stats?.month_net >= 0 ? '#28a745' : '#dc3545' }}>
                {formatCurrency(stats?.month_net)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Payments Sidebar */}
      {upcomingPayments.length > 0 && (
        <div className="card" style={{ marginTop: '24px', borderLeft: '4px solid #ffc107' }}>
          <h3 className="card-title" style={{ color: '#f57c00', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaClock /> Upcoming Payments ({upcomingPayments.length})
          </h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Building</th>
                  <th>Flat</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingPayments.slice(0, 5).map((payment) => (
                  <tr key={payment.id}>
                    <td style={{ fontWeight: '600' }}>{payment.tenant_name}</td>
                    <td>{payment.building_name}</td>
                    <td>Flat {payment.flat_number}</td>
                    <td>{formatDate(payment.due_date)}</td>
                    <td style={{ fontWeight: '600', color: '#f57c00' }}>
                      {formatCurrency(payment.amount)}
                    </td>
                    <td>
                      <span className="badge badge-warning">
                        Due Soon
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Overdue Payments */}
      {overduePayments.length > 0 && (
        <div className="card" style={{ marginTop: '24px', borderLeft: '4px solid #dc3545' }}>
          <h3 className="card-title" style={{ color: '#dc3545', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaExclamationTriangle /> Overdue Payments ({overduePayments.length})
          </h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Building</th>
                  <th>Flat</th>
                  <th>Due Date</th>
                  <th>Days Overdue</th>
                  <th>Amount</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {overduePayments.slice(0, 10).map((payment) => (
                  <tr key={payment.id}>
                    <td style={{ fontWeight: '600' }}>{payment.tenant_name}</td>
                    <td>{payment.building_name}</td>
                    <td>Flat {payment.flat_number}</td>
                    <td>{formatDate(payment.due_date)}</td>
                    <td>
                      <span className="badge badge-danger">
                        {payment.days_overdue} days
                      </span>
                    </td>
                    <td style={{ fontWeight: '600', color: '#dc3545' }}>
                      {formatCurrency(payment.balance)}
                    </td>
                    <td>{payment.tenant_contact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Activities */}
      <div className="card-grid" style={{ marginTop: '24px' }}>
        <div className="card">
          <h3 className="card-title">Recent Payments (Last 5)</h3>
          {recentPayments.length > 0 ? (
            <div style={{ marginTop: '16px' }}>
              {recentPayments.slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  style={{
                    padding: '12px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600' }}>{payment.tenant_name}</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      {payment.building_name} - Flat {payment.flat_number}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {formatDate(payment.payment_date)}
                    </div>
                  </div>
                  <div style={{ fontWeight: '600', color: '#28a745' }}>
                    {formatCurrency(payment.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', marginTop: '16px' }}>No recent payments</p>
          )}
        </div>

        <div className="card">
          <h3 className="card-title">Recent Expenses (Last 5)</h3>
          {recentExpenses.length > 0 ? (
            <div style={{ marginTop: '16px' }}>
              {recentExpenses.slice(0, 5).map((expense) => (
                <div
                  key={expense.id}
                  style={{
                    padding: '12px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600' }}>{expense.category}</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      {expense.description || expense.building_name || 'General'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {formatDate(expense.expense_date)}
                    </div>
                  </div>
                  <div style={{ fontWeight: '600', color: '#dc3545' }}>
                    {formatCurrency(expense.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', marginTop: '16px' }}>No recent expenses</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
