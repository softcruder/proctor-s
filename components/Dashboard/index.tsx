import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for the performance chart
const performanceData = [
  { day: 'Sun', score: 20 },
  { day: 'Mon', score: 40 },
  { day: 'Tue', score: 50 },
  { day: 'Wed', score: 68 },
  { day: 'Thu', score: 60 },
  { day: 'Fri', score: 70 },
  { day: 'Sat', score: 50 },
];

const Dashboard = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Notification */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
        <p>New test is live now. <a href="#" className="font-bold underline">Solve it</a></p>
      </div>
      
      {/* Welcome Card */}
      <div className="bg-blue-600 text-white p-6 rounded-lg mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Hi, Tanvir Ahassan</h2>
          <p className="mb-4">You have 4 tests to complete. You already completed 80% of the daily topic. Your progress is very good.</p>
          <button className="bg-white text-blue-600 px-4 py-2 rounded">Continue Learning</button>
        </div>
        <div className="w-1/4">
          {/* Placeholder for illustration */}
          <div className="bg-blue-500 h-32 w-32 rounded-full"></div>
        </div>
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Overall Score</h3>
          <p className="text-4xl font-bold text-blue-600">49</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Accuracy (%)</h3>
          <p className="text-4xl font-bold text-blue-600">12</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Attempted</h3>
          <p className="text-4xl font-bold text-blue-600">25</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Perchantage (%)</h3>
          <p className="text-4xl font-bold text-blue-600">16</p>
        </div>
      </div>
      
      {/* Performance Chart */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Performance Overtime</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Subjectwise Strength */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Subjectwise Strength</h3>
        <div className="space-y-4">
          {['Urology', 'Biology', 'Psychology', 'Physiology', 'Anatomy'].map((subject, index) => (
            <div key={subject} className="flex items-center">
              <span className="w-24">{subject}</span>
              <div className="flex-grow bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${['bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-green-500', 'bg-blue-500'][index]}`} 
                  style={{width: `${[29, 46, 68, 87, 95][index]}%`}}
                ></div>
              </div>
              <span className="w-12 text-right">{[29, 46, 68, 87, 95][index]}%</span>
            </div>
          ))}
        </div>
        <button className="mt-4 text-blue-600 font-semibold">View Details</button>
      </div>
    </div>
  );
};

export default Dashboard;