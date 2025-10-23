'use client';

import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieLabelRenderProps } from 'recharts';
import { Download, FileSpreadsheet, FileText, Filter, Calendar, Users, DollarSign, FileCheck } from 'lucide-react';

interface Conference {
  id: string;
  name: string;
}

interface RegistrationDataPoint {
  month: string;
  registrations: number;
}

interface AttendanceDataPoint {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface RevenueDataPoint {
  category: string;
  amount: number;
}

interface PaperStats {
  submitted: number;
  accepted: number;
  rejected: number;
  pending: number;
}

interface SelectedSections {
  registration: boolean;
  attendance: boolean;
  revenue: boolean;
  papers: boolean;
}

type ExportFormat = 'xlsx' | 'csv' | 'pdf';

export default function OrganizerPage() {
  const [selectedConference, setSelectedConference] = useState<string>('conf-2024');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('xlsx');
  const [selectedSections, setSelectedSections] = useState<SelectedSections>({
    registration: true,
    attendance: true,
    revenue: true,
    papers: true
  });
  const [showExportDialog, setShowExportDialog] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const conferences: Conference[] = [
    { id: 'conf-2024', name: 'Tech Conference 2024' },
    { id: 'conf-2023', name: 'Tech Conference 2023' },
    { id: 'ai-summit', name: 'AI Summit 2024' }
  ];

  const registrationData: RegistrationDataPoint[] = [
    { month: 'Jan', registrations: 45 },
    { month: 'Feb', registrations: 78 },
    { month: 'Mar', registrations: 120 },
    { month: 'Apr', registrations: 156 },
    { month: 'May', registrations: 203 }
  ];

  const attendanceData: AttendanceDataPoint[] = [
    { name: 'Attended', value: 485, color: '#10b981' },
    { name: 'Registered', value: 118, color: '#f59e0b' },
    { name: 'Cancelled', value: 32, color: '#ef4444' }
  ];

  const revenueData: RevenueDataPoint[] = [
    { category: 'Early Bird', amount: 45000 },
    { category: 'Regular', amount: 78000 },
    { category: 'Late', amount: 23000 },
    { category: 'Sponsors', amount: 150000 }
  ];

  const paperStats: PaperStats = {
    submitted: 234,
    accepted: 89,
    rejected: 98,
    pending: 47
  };

  const handleSectionToggle = (section: keyof SelectedSections): void => {
    setSelectedSections(prev => ({ ...prev, [section]: !prev[section as keyof SelectedSections] }));
  };

  const handleExport = (): void => {
    setShowExportDialog(false);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Conference Statistics</h1>
          <p className="text-gray-600">Xin chào Organizer! Quản lý và xuất báo cáo thống kê hội nghị.</p>
        </div>

        {/* Conference Selection & Export */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Select Conference
              </label>
              <select 
                value={selectedConference}
                onChange={(e) => setSelectedConference(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {conferences.map(conf => (
                  <option key={conf.id} value={conf.id}>{conf.name}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => setShowExportDialog(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Download className="w-4 h-4" />
              Export Statistics
            </button>
          </div>
        </div>

        {/* Success Message */}
        {exportSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <FileCheck className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">Conference statistics exported successfully.</p>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-gray-500">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">635</h3>
            <p className="text-sm text-gray-600">Registrations</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium text-gray-500">Rate</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">76%</h3>
            <p className="text-sm text-gray-600">Attendance</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-gray-500">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">$296K</h3>
            <p className="text-sm text-gray-600">Revenue</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-orange-600" />
              <span className="text-sm font-medium text-gray-500">Accepted</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">89</h3>
            <p className="text-sm text-gray-600">Research Papers</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registration Trend */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={registrationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="registrations" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Attendance Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: PieLabelRenderProps) => {
                    const RADIAN = Math.PI / 180;
                    const { cx, cy, midAngle, innerRadius, outerRadius, name, percent } = props;
                    const radius = (innerRadius as number) + ((outerRadius as number) - (innerRadius as number)) * 0.5;
                    const x = (cx as number) + radius * Math.cos(-(midAngle as number) * RADIAN);
                    const y = (cy as number) + radius * Math.sin(-(midAngle as number) * RADIAN);
                    const percentValue = typeof percent === 'number' ? percent : 0;
                    
                    return (
                      <text 
                        x={x} 
                        y={y} 
                        fill="white" 
                        textAnchor={x > (cx as number) ? 'start' : 'end'} 
                        dominantBaseline="central"
                        className="text-sm font-semibold"
                      >
                        {`${name}: ${(percentValue * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Paper Statistics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Paper Statistics</h3>
            <div className="space-y-4 mt-8">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Submitted</span>
                <span className="text-2xl font-bold text-gray-900">{paperStats.submitted}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Accepted</span>
                <span className="text-2xl font-bold text-green-600">{paperStats.accepted}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '38%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Rejected</span>
                <span className="text-2xl font-bold text-red-600">{paperStats.rejected}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: '42%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Review</span>
                <span className="text-2xl font-bold text-orange-600">{paperStats.pending}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Export Statistics</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Filter className="inline w-4 h-4 mr-1" />
                Select Sections to Include
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedSections.registration}
                    onChange={() => handleSectionToggle('registration')}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Registration Data</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedSections.attendance}
                    onChange={() => handleSectionToggle('attendance')}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Attendance Data</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedSections.revenue}
                    onChange={() => handleSectionToggle('revenue')}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Revenue Data</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedSections.papers}
                    onChange={() => handleSectionToggle('papers')}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Research Papers Data</span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <FileSpreadsheet className="inline w-4 h-4 mr-1" />
                Export Format
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setExportFormat('xlsx')}
                  className={`p-3 border-2 rounded-lg text-center transition-all ${
                    exportFormat === 'xlsx' 
                      ? 'border-blue-600 bg-blue-50 text-blue-600' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <FileSpreadsheet className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-xs font-medium">Excel</span>
                </button>
                <button
                  onClick={() => setExportFormat('csv')}
                  className={`p-3 border-2 rounded-lg text-center transition-all ${
                    exportFormat === 'csv' 
                      ? 'border-blue-600 bg-blue-50 text-blue-600' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <FileText className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-xs font-medium">CSV</span>
                </button>
                <button
                  onClick={() => setExportFormat('pdf')}
                  className={`p-3 border-2 rounded-lg text-center transition-all ${
                    exportFormat === 'pdf' 
                      ? 'border-blue-600 bg-blue-50 text-blue-600' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <FileText className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-xs font-medium">PDF</span>
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowExportDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Statistics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}