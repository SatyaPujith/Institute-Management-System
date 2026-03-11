import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, CheckCircle, Clock, IndianRupee, AlertCircle, Calendar } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentItem {
  id: string;
  type: 'course' | 'event';
  name: string;
  amount: number;
  status: string;
  description?: string;
  date?: string;
}

export default function StudentPayment() {
  const { token, user } = useAuth();
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPaymentInfo();
    loadRazorpayScript();
  }, [token]);

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const fetchPaymentInfo = async () => {
    try {
      const res = await fetch('/api/student/all-payments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPaymentItems(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch payment info', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (item: PaymentItem) => {
    if (item.status === 'Paid') return;

    setProcessing(true);

    try {
      // Create order on backend
      const orderRes = await fetch('/api/student/create-payment-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          item_id: item.id,
          item_type: item.type,
          amount: item.amount
        })
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await orderRes.json();

      // Razorpay options
      const options = {
        key: orderData.key || 'rzp_test_dummy_key',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Forex Institute',
        description: `Payment for ${item.name}`,
        order_id: orderData.order_id,
        handler: async function (response: any) {
          // Verify payment on backend
          try {
            const verifyRes = await fetch('/api/student/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                item_id: item.id,
                item_type: item.type
              })
            });

            if (verifyRes.ok) {
              alert('Payment successful!');
              fetchPaymentInfo();
            } else {
              alert('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error', error);
            alert('Payment verification failed');
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email
        },
        theme: {
          color: '#111827'
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error', error);
      alert('Failed to initiate payment');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const totalPending = paymentItems.filter(item => item.status === 'Pending').reduce((sum, item) => sum + item.amount, 0);
  const totalPaid = paymentItems.filter(item => item.status === 'Paid').reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-gray-900">Payments</h1>
        <p className="mt-2 text-sm text-gray-500">Manage your course and event payments</p>
      </div>

      {paymentItems.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Payments Required</h3>
          <p className="mt-1 text-sm text-gray-500">You don't have any pending payments at the moment.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Pending</p>
              <p className="text-3xl font-light text-red-600 flex items-center">
                <IndianRupee className="h-6 w-6" />
                {totalPending.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Paid</p>
              <p className="text-3xl font-light text-green-600 flex items-center">
                <IndianRupee className="h-6 w-6" />
                {totalPaid.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Items</p>
              <p className="text-3xl font-light text-gray-900">{paymentItems.length}</p>
            </div>
          </div>

          {/* Payment Items */}
          <div className="space-y-4">
            {paymentItems.map((item) => (
              <div key={`${item.type}-${item.id}`} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          item.type === 'course' ? 'bg-blue-50' : 'bg-purple-50'
                        }`}>
                          {item.type === 'course' ? (
                            <CreditCard className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Calendar className="h-5 w-5 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">
                            {item.type === 'course' ? 'Course Fee' : 'Event Fee'}
                          </p>
                        </div>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-2 ml-13">{item.description}</p>
                      )}
                      {item.date && (
                        <p className="text-xs text-gray-500 mt-1 ml-13">Date: {item.date}</p>
                      )}
                    </div>
                    <div className="ml-6 text-right">
                      <p className="text-2xl font-light text-gray-900 flex items-center justify-end mb-2">
                        <IndianRupee className="h-5 w-5" />
                        {item.amount.toLocaleString('en-IN')}
                      </p>
                      {item.status === 'Paid' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Paid
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePayment(item)}
                          disabled={processing}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          {processing ? 'Processing...' : 'Pay Now'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Info */}
          <div className="mt-8 bg-gray-50 border border-gray-100 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Payment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-gray-600 mb-2">Accepted Payment Methods</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs">Credit Card</span>
                  <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs">Debit Card</span>
                  <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs">UPI</span>
                  <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs">Net Banking</span>
                </div>
              </div>
              <div>
                <p className="text-gray-600 mb-2">Need Help?</p>
                <p className="text-gray-900">Contact: support@forexinstitute.com</p>
                <p className="text-gray-500 text-xs mt-1">Secure payment powered by Razorpay</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
