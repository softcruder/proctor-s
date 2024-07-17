import React, { useState } from 'react';

interface RegistrationData {
  username: string;
  email: string;
  membership_type: 'Student' | 'Teacher';
  matricNumber?: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegistrationData>({
    username: '',
    email: '',
    membership_type: 'Student',
    matricNumber: '',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Implement logic to submit registration data (e.g., API call)
    console.log('Registration data submitted:', formData);

    // Handle success or error response (if applicable)

    setFormData({ ...formData, username: '', email: '', matricNumber: '' }); // Clear form after submit
  };

  return (
    <div className="register-container max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username (Student ID)</label>
          <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div className="form-group">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div className="form-group">
          <label htmlFor="membershipType" className="block text-sm font-medium text-gray-700">Membership Type</label>
          <select id="membershipType" name="membershipType" value={formData.membership_type} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="Student">Student</option>
            <option value="Teacher">Teacher</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="matricNumber" className="block text-sm font-medium text-gray-700">Matric Number (Optional)</label>
          <input type="text" id="matricNumber" name="matricNumber" value={formData.matricNumber} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <button type="submit" className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">Register</button>
      </form>
    </div>
  );
};

export default Register;