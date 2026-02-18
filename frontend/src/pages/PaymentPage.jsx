// ===================================================================
// FRONTEND: Payment Page Component
// File: src/pages/PaymentPage.jsx
// ===================================================================

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  CreditCard, Lock, CheckCircle, XCircle, AlertCircle, 
  Clock, BookOpen, ArrowLeft, Shield, Award, Users 
} from 'lucide-react';

export default function PaymentPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourseDetails();
    loadRazorpayScript();
  }, [courseId]);

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchCourseDetails = async () => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      if (response.data && response.data.success) {
        setCourse(response.data.course);
      } else if (response.data) {
        setCourse(response.data);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);
      setError(null);

      // Step 1: Create order
      const orderResponse = await api.post('/payments/create-order', {
        course_id: courseId
      });

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || 'Failed to create order');
      }

      const { order, key } = orderResponse.data;

      // Step 2: Initialize Razorpay
      const options = {
        key: key,
        amount: order.amount,
        currency: order.currency,
        name: 'Upskillize LMS',
        description: course.course_name || course.name,
        order_id: order.id,
        image: '/logo.png', // Your logo URL
        handler: async function (response) {
          try {
            // Step 3: Verify payment
            const verifyResponse = await api.post('/payments/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.data.success) {
              // Payment successful
              alert(`✅ Payment successful! You are now enrolled in ${verifyResponse.data.course_name}`);
              navigate('/student/courses'); // Redirect to My Courses
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Verification error:', error);
            alert('❌ Payment verification failed. Please contact support.');
            setProcessing(false);
          }
        },
        prefill: {
          name: '', // Will be filled from user profile
          email: '', // Will be filled from user profile
          contact: '' // Will be filled from user profile
        },
        theme: {
          color: '#3b82f6'
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
            setError('Payment cancelled by user');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      setError(error.response?.data?.message || error.message || 'Payment failed');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/student/browse')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  const courseName = course.course_name || course.name;
  const coursePrice = course.price || 0;
  const courseDuration = course.duration_hours || 0;
  const courseDescription = course.description || '';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={20} />
          <span>Back to Courses</span>
        </button>

        {/* Main Payment Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center gap-3 text-white mb-2">
              <Shield className="h-6 w-6" />
              <span className="text-sm font-semibold">SECURE PAYMENT</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Complete Your Enrollment</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Left Column - Course Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{courseName}</h2>
                <p className="text-gray-600">{courseDescription}</p>
              </div>

              {/* Course Features */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={20} />
                  What you'll get:
                </h3>
                <ul className="space-y-2 ml-7">
                  <li className="flex items-center gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>{courseDuration} hours of content</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Lifetime access to course materials</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Certificate upon completion</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Access to discussion forums</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Progress tracking & analytics</span>
                  </li>
                </ul>
              </div>

              {/* Security Badges */}
              <div className="border-t pt-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Secure Payment</p>
                  </div>
                  <div className="text-center">
                    <Lock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">SSL Encrypted</p>
                  </div>
                  <div className="text-center">
                    <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Certified Course</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Summary */}
            <div className="space-y-6">
              {/* Price Summary */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h3 className="font-bold text-gray-900 text-lg">Order Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Course Price</span>
                    <span className="font-semibold">₹{coursePrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (18% GST)</span>
                    <span className="font-semibold">₹{(coursePrice * 0.18).toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total Amount</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ₹{(coursePrice * 1.18).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-red-900">Payment Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <button onClick={handlePayment} disabled={processing}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg">
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    Proceed to Payment
                  </>
                )}
              </button>

              {/* Payment Methods */}
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-3">Accepted Payment Methods</p>
                <div className="flex justify-center items-center gap-3">
                  <div className="bg-white border rounded px-3 py-2 text-xs font-semibold text-gray-700">
                    💳 Cards
                  </div>
                  <div className="bg-white border rounded px-3 py-2 text-xs font-semibold text-gray-700">
                    🏦 UPI
                  </div>
                  <div className="bg-white border rounded px-3 py-2 text-xs font-semibold text-gray-700">
                    🏦 Net Banking
                  </div>
                  <div className="bg-white border rounded px-3 py-2 text-xs font-semibold text-gray-700">
                    📱 Wallets
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle size={16} />
                  <span className="text-sm font-semibold">100% Secure & Encrypted</span>
                </div>
                <p className="text-xs text-gray-500">
                  Powered by Razorpay • PCI DSS Compliant
                </p>
              </div>

              {/* Money Back Guarantee */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="text-green-600" size={20} />
                  <span className="font-bold text-gray-900">30-Day Money Back Guarantee</span>
                </div>
                <p className="text-xs text-gray-600">
                  Not satisfied? Get a full refund within 30 days, no questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Important Information</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• You will get instant access to the course after successful payment</li>
                <li>• An email confirmation will be sent to your registered email</li>
                <li>• You can access the course from any device</li>
                <li>• Contact support@upskillize.com for any payment issues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

