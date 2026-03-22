import { useSearchParams } from 'react-router-dom';

export default function EsewaMockCheckoutPage() {
  const [searchParams] = useSearchParams();

  // eSewa v2 signature-based form fields
  const amount = searchParams.get('amount') || '0';
  const totalAmount = searchParams.get('total_amount') || '0';
  const transactionUuid = searchParams.get('transaction_uuid') || '';
  const productCode = searchParams.get('product_code') || '';
  const successUrl = searchParams.get('success_url') || '';
  const failureUrl = searchParams.get('failure_url') || '';
  const signature = searchParams.get('signature') || '';

  const handleSimulateSuccess = () => {
    // In real eSewa v2, they redirect with a 'data' param (base64 encoded JSON)
    const transactionCode = 'MOCK-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const mockData = {
      transaction_code: transactionCode,
      status: 'COMPLETE',
      total_amount: totalAmount.replace(/,/g, ''),
      transaction_uuid: transactionUuid,
      product_code: productCode,
      signature: 'MOCK_VERIFY_SIGNATURE', // Real verify would require HMAC-SHA256 from backend
      signed_field_names: 'transaction_code,status,total_amount,transaction_uuid,product_code'
    };

    const encodedData = btoa(JSON.stringify(mockData));
    window.location.href = `${successUrl}?data=${encodedData}`;
  };

  const handleSimulateFailure = () => {
    window.location.href = failureUrl;
  };

  return (
    <div className="min-h-screen bg-[#61b14b] flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6">
        <img 
          src="https://esewa.com.np/common/images/esewa_logo.png" 
          alt="eSewa" 
          className="h-16 mx-auto mb-4"
        />
        
        <div className="border-y border-gray-100 py-4 space-y-2">
          <p className="text-gray-500 text-sm">Amount to pay</p>
          <p className="text-3xl font-bold text-gray-800 font-fraunces">Rs. {totalAmount}</p>
          <div className="text-xs text-gray-400">
            <p>Product: {productCode}</p>
            <p>Ref: {transactionUuid.split('-')[0]}</p>
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleSimulateSuccess}
            className="w-full bg-[#61b14b] py-3 rounded-lg text-white font-bold hover:bg-[#52a03d] transition-colors"
          >
            Simulate SUCCESS
          </button>
          <button 
            onClick={handleSimulateFailure}
            className="w-full bg-red-500 py-3 rounded-lg text-white font-bold hover:bg-red-600 transition-colors"
          >
            Simulate FAILURE
          </button>
        </div>

        <p className="text-[10px] text-gray-400 italic">
          This is a mock eSewa gateway for MediReach development.
          <br />Signature: {signature.substring(0, 10)}...
        </p>
      </div>
      
      <p className="text-white/80 mt-8 text-sm">Secure Payment with eSewa</p>
    </div>
  );
}
