import React, { useEffect, useState } from 'react';
import './Analytics.css';
import { backend_url } from '../../App';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenueByMonth: [],
    ordersByStatus: [],
    topProducts: [],
    categoryDistribution: [],
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`${backend_url}/analytics`);
      const data = await response.json();
      if (data.success) {
        setAnalyticsData({
          totalRevenue: data.data.totalRevenue || 0,
          totalOrders: data.data.totalOrders || 0,
          totalProducts: data.data.totalProducts || 0,
          totalUsers: data.data.totalUsers || 0,
          revenueByMonth: data.data.revenueByMonth || [],
          ordersByStatus: data.data.ordersByStatus || [],
          topProducts: data.data.topProducts || [],
          categoryDistribution: data.data.categoryDistribution || [],
          recentOrders: data.data.recentOrders || []
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="analytics-loading">Loading Analytics...</div>;
  }

  return (
    <div className="analytics-container">
      <h1 className="analytics-title">📊 Analytics Dashboard</h1>

      {/* Summary Cards */}
      <div className="analytics-cards">
        <div className="analytics-card card-revenue">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Total Revenue</h3>
            <p className="card-value">₹{analyticsData.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="analytics-card card-orders">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <h3>Total Orders</h3>
            <p className="card-value">{analyticsData.totalOrders}</p>
          </div>
        </div>
        <div className="analytics-card card-products">
          <div className="card-icon">🛍️</div>
          <div className="card-content">
            <h3>Total Products</h3>
            <p className="card-value">{analyticsData.totalProducts}</p>
          </div>
        </div>
        <div className="analytics-card card-users">
          <div className="card-icon">👥</div>
          <div className="card-content">
            <h3>Total Users</h3>
            <p className="card-value">{analyticsData.totalUsers}</p>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-row">
        {/* Revenue Trend Chart */}
        <div className="chart-container">
          <h2>Revenue Trend (Last 6 Months)</h2>
          {analyticsData.revenueByMonth && analyticsData.revenueByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.revenueByMonth}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value?.toLocaleString() || 0}`} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">No revenue data available</p>
          )}
        </div>

        {/* Orders by Status Pie Chart */}
        <div className="chart-container">
          <h2>Orders by Status</h2>
          {analyticsData.ordersByStatus && analyticsData.ordersByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.ordersByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.ordersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">No order status data available</p>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-row">
        {/* Top Products Bar Chart */}
        <div className="chart-container">
          <h2>Top Selling Products</h2>
          {analyticsData.topProducts && analyticsData.topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#82ca9d" name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">No product sales data available</p>
          )}
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="chart-container">
          <h2>Product Category Distribution</h2>
          {analyticsData.categoryDistribution && analyticsData.categoryDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {analyticsData.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">No category data available</p>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="recent-orders-section">
        <h2>Recent Orders</h2>
        <div className="orders-table-container">
          {analyticsData.recentOrders && analyticsData.recentOrders.length > 0 ? (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.recentOrders.map((order, index) => (
                  <tr key={index}>
                    <td>#{order?.orderId || 'N/A'}</td>
                    <td>{order?.customerName || 'N/A'}</td>
                    <td>{order?.date ? new Date(order.date).toLocaleDateString() : 'N/A'}</td>
                    <td>₹{order?.amount?.toLocaleString() || 0}</td>
                    <td>
                      <span className={`status-badge status-${order?.status?.toLowerCase() || 'pending'}`}>
                        {order?.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No recent orders available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
