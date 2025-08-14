import { useState } from 'react';
import axios from 'axios';

export default function UdyamRegistrationForm() {
  const [step, setStep] = useState(1);

// Configure API base URL
const API_BASE = 'http://localhost:5100/api/v1/registration';
  const [formData, setFormData] = useState({
    aadhaar: '',
    name: '',
    otp: '',
    pan: '',
    consent: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
 const [apiMode, setApiMode] = useState(true); 
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

 const validateAadhaar = () => {
  const cleaned = formData.aadhaar.replace(/\s/g, '');
  if (!/^\d{12}$/.test(cleaned)) {
    setError("Please enter a valid 12-digit Aadhaar number");
    return false;
  }
  if (!formData.name || formData.name.trim().length < 3) {
    setError("Please enter your full name (min 3 characters)");
    return false;
  }
  return true;
};



const handleAadhaarChange = (e) => {
  let digits = e.target.value.replace(/\D/g, '').slice(0, 12);
  setFormData(prev => ({ ...prev, aadhaar: digits }));
};

const formattedAadhaar = formData.aadhaar.replace(/(\d{4})(?=\d)/g, '$1 ').trim();


  const handleGenerateOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateAadhaar()) return;
    
    setLoading(true);
    
    try {
      if (apiMode) {
        // Real API call
        const response = await axios.post(`${API_BASE}/aadhaar`, {
          aadhaar: formData.aadhaar.replace(/\s/g, ''),
          name: formData.name
        });
        
        if (response.data) {
          setStep(2);
          console.log(response.data);
          localStorage.setItem('sessionId',response.data.sessionId)
        } else {
          throw new Error(response.data.message || 'Aadhaar validation failed');
        }
      } else {
        // Mock data fallback
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'API request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!/^\d{6}$/.test(formData.otp)) {
      setError('OTP must be 6 digits');
      return;
    }
    
    setLoading(true);
    
    try {
      if (apiMode) {
        // Real API call
        console.log(localStorage.getItem('sessionId'));
        
        const response = await axios.post(`${API_BASE}/otp`, {
          sessionId : localStorage.getItem('sessionId'),
          otp: formData.otp
        });
        
        if (response.data.success) {
          setStep(3);
        } else {
          throw new Error(response.data.message || 'OTP validation failed');
        }
      } else {
        // Mock data fallback
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };
const mockData = {
    aadhaar: "123456789012",
    name: "John Doe",
    otp: "123456",
    pan: "ABCDE1234F"
  
};


  const handleSubmitPAN = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(formData.pan)) {
      setError('Invalid PAN format');
      return;
    }
    
    if (!formData.consent) {
      setError('You must consent to the terms');
      return;
    }
    
    setLoading(true);
  try {
      if (apiMode) {
        // Real API call would go here
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Registration successful (API mode)');
      } else {
        // Mock mode
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Registration successful (Mock mode)');
      }
    } catch (err) {
      setError(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          {/* Mode Toggle Switch */}
           <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={apiMode}
          onChange={() => setApiMode(!apiMode)}
        />
        <div className="relative w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
        <span className="ml-3 text-sm font-medium text-gray-700">
          {apiMode ? "API Mode" : "Mock Mode"}
        </span>
      </label>

          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 text-white rounded-full p-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
            Udyam Registration
          </h2>
          <p className="text-gray-600 text-center mb-8">
            {step === 1 ? 'Aadhaar Verification' : 
             step === 2 ? 'OTP Verification' : 'PAN Details'}
          </p>
          
          {/* Progress Steps */}
          <div className="flex justify-between mb-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
            <div className={`absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 transition-all duration-300 ${
              step >= 2 ? 'w-2/3' : step >= 1 ? 'w-1/3' : 'w-0'
            }`}></div>
            
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                  ${step >= i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {i}
                </div>
                <div className={`text-xs mt-1 ${step >= i ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                  {i === 1 ? 'Aadhaar' : i === 2 ? 'OTP' : 'PAN'}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Aadhaar Verification */}
          {step === 1 && (
            <form onSubmit={handleGenerateOTP}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-700 mb-1">
                    Aadhaar Number
                  </label>
                  <input
                    type="text"
                    id="aadhaar"
                    name="aadhaar"
                    value={formData.aadhaar}
                    onChange={handleAadhaarChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 tracking-widest"
                    placeholder="1234 5678 9012"
                    inputMode="numeric"
                  />
                  {!apiMode && (
                    <p className="text-xs text-gray-500 mt-1">
                      Mock data: Use <span className="font-mono">123456789012</span>
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name as per Aadhaar
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                  {!apiMode && (
                    <p className="text-xs text-gray-500 mt-1">
                      Mock data: Use any name (min 3 chars)
                    </p>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2 px-4 rounded-md text-white font-medium ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Generate & Validate OTP'}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP}>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    {apiMode ? (
                      'OTP has been sent to your registered mobile number'
                    ) : (
                      <>
                        Mock OTP: <span className="font-bold text-blue-800 ">{mockData?.otp}</span>
                      </>
                    )}
                  </p>
                </div>
                
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    inputMode="numeric"
                  />
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`py-2 px-4 rounded-md text-white font-medium ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {loading ? 'Verifying...' : 'Validate OTP'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Step 3: PAN Details */}
          {step === 3 && (
            <form onSubmit={handleSubmitPAN}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="pan" className="block text-sm font-medium text-gray-700 mb-1">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    id="pan"
                    name="pan"
                    value={formData.pan}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 uppercase"
                    placeholder="ABCDE1234F"
                    maxLength="10"
                  />
                  {!apiMode && (
                    <p className="text-xs text-gray-500 mt-1">
                      Mock data: Use <span className="font-mono">{mockData.pan}</span>
                    </p>
                  )}
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="consent"
                      name="consent"
                      type="checkbox"
                      checked={formData.consent}
                      onChange={handleChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="consent" className="font-medium text-gray-700">
                      I consent to verify my PAN details
                    </label>
                    <p className="text-gray-500">Your PAN will be verified with Income Tax database</p>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`py-2 px-4 rounded-md text-white font-medium ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {loading ? 'Submitting...' : 'Complete Registration'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
