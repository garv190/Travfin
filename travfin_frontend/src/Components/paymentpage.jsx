import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get transaction ID from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const transactionId = queryParams.get('id');

  const handleCashPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Send DELETE request to backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/payments`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ transactionId }),
      });


      navigate('/');
      alert("Transaction has been completed")

      if (!response.ok) {
        throw new Error('Payment failed. Please try again.');
       
      }

      // Redirect to home page after successful deletion
     
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Payment Methods
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {error && (
          <div className="mb-4 p-2 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleCashPayment}
            disabled={loading}
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
          >
            {loading ? (
              'Processing...'
            ) : (
              'Payment via Cash'
            )}
          </button>

          <button
            type="button"
            className="flex w-full justify-center rounded-md bg-green-400 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-green-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          >
            Payment via UPI
          </button>
        </div>
      </div>
    </div>
  );
}