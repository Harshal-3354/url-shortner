import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  Bar, 
  Line, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { 
  ArrowLeft,
  Calendar,
  Users,
  Eye,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  BarChart3
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface AnalyticsData {
  url: {
    id: string;
    originalUrl: string;
    shortUrl: string;
    createdAt: string;
  };
  summary: {
    totalClicks: number;
    uniqueVisitors: number;
    periodClicks: number;
    periodUniqueVisitors: number;
    averageClicksPerDay: number;
  };
  charts: {
    timeSeries: Array<{
      date: string;
      clicks: number;
      uniqueVisitors: number;
    }>;
    devices: Array<{
      device: string;
      count: number;
    }>;
    browsers: Array<{
      browser: string;
      count: number;
    }>;
    locations: Array<{
      country: string;
      count: number;
    }>;
    referrers: Array<{
      referrer: string;
      count: number;
    }>;
  };
  period: {
    start: string;
    end: string;
    type: string;
  };
}

const Analytics: React.FC = () => {
  const { urlId } = useParams<{ urlId: string }>();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    if (urlId) {
      fetchAnalytics();
    }
  }, [urlId, period]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`/api/analytics/url/${urlId}?period=${period}`);
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const getFullShortUrl = (shortUrl: string) => {
    return `${window.location.origin}/${shortUrl}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics not found</h2>
          <Link to="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-full shadow-2xl">
              <BarChart3 className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
            URL Analytics
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Detailed insights and performance metrics for your shortened URL
          </p>
          
          {/* Back Button */}
          <div className="mt-6">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-blue-600 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>

        {/* URL Info */}
        <div className="bg-white rounded-3xl shadow-2xl border-0 mb-8 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">URL Information</h3>
            <p className="text-gray-600">Details about your shortened URL</p>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Short URL</h4>
                <p className="text-blue-600 font-mono text-lg bg-blue-50 p-3 rounded-xl">{getFullShortUrl(analytics.url.shortUrl)}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Original URL</h4>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-xl truncate" title={analytics.url.originalUrl}>
                  {analytics.url.originalUrl}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
            <div className="flex items-center space-x-4">
              <Calendar className="h-6 w-6 text-blue-600" />
              <label className="text-lg font-semibold text-gray-800">Time Period:</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="flex-1 text-lg py-2 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 rounded-xl"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Clicks</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{analytics.summary.totalClicks}</p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 mb-1">Unique Visitors</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{analytics.summary.uniqueVisitors}</p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 mb-1">Period Clicks</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{analytics.summary.periodClicks}</p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 mb-1">Avg/Day</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{analytics.summary.averageClicksPerDay}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-12">
          {/* Time Series Chart */}
          <div className="bg-white rounded-3xl shadow-2xl border-0 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Clicks Over Time</h3>
              <p className="text-gray-600">Daily click and visitor trends for your URL</p>
            </div>
            <div className="p-8">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.charts.timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Clicks"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="uniqueVisitors" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Unique Visitors"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Device and Browser Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Device Chart */}
            <div className="bg-white rounded-3xl shadow-2xl border-0 overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Device Types</h3>
                <p className="text-gray-600">Traffic distribution by device category</p>
              </div>
              <div className="p-8">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.charts.devices}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ device, percent }) => `${device} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.charts.devices.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Browser Chart */}
            <div className="bg-white rounded-3xl shadow-2xl border-0 overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Browsers</h3>
                <p className="text-gray-600">Traffic distribution by web browser</p>
              </div>
              <div className="p-8">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.charts.browsers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="browser" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Location and Referrer Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Location Chart */}
            <div className="bg-white rounded-3xl shadow-2xl border-0 overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Geographic Distribution</h3>
                <p className="text-gray-600">Traffic distribution by country and region</p>
              </div>
              <div className="p-8">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.charts.locations} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="country" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Referrer Chart */}
            <div className="bg-white rounded-3xl shadow-2xl border-0 overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Traffic Sources</h3>
                <p className="text-gray-600">Where your visitors came from</p>
              </div>
              <div className="p-8">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.charts.referrers}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ referrer, percent }) => `${referrer} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.charts.referrers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Period Info */}
        <div className="mt-12 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg px-8 py-6 max-w-md mx-auto">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-800">
              Data from {formatDate(analytics.period.start)} to {formatDate(analytics.period.end)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {analytics.period.type === '24h' ? 'Last 24 Hours' : 
               analytics.period.type === '7d' ? 'Last 7 Days' :
               analytics.period.type === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
