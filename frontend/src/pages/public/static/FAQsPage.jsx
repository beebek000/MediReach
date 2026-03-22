import StaticPageLayout from "../../../components/layout/StaticPageLayout";
import { Link } from "react-router-dom";

export default function FAQsPage() {
  return (
    <StaticPageLayout title="Frequently Asked Questions (FAQs)">
      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold text-charcoal mb-2">How do I order prescription medicines?</h3>
          <p className="text-charcoal/70">
            You can order prescription medicines by first adding them to your cart, and then proceeding to checkout. During checkout, you will be prompted to upload a valid photo or PDF of your doctor's prescription. Our licensed pharmacists will verify it before dispatching your order. Alternatively, you can upload a prescription directly from the <Link to="/customer/prescriptions" className="text-primary hover:underline">Prescriptions page</Link>.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-charcoal mb-2">What payment methods do you accept?</h3>
          <p className="text-charcoal/70">
            We accept Cash on Delivery (COD) as well as secure online payments via eSewa.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-charcoal mb-2">Are the medicines genuine?</h3>
          <p className="text-charcoal/70">
            Yes, completely. We strictly source our inventory from certified pharmaceutical distributors and licensed partner pharmacies. We guarantee 100% authenticity on all items.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-charcoal mb-2">How can I track my order?</h3>
          <p className="text-charcoal/70">
            Once your order is confirmed, you can track its status in real-time by visiting the <Link to="/customer/track" className="text-primary hover:underline">Track Order</Link> section in your dashboard.
          </p>
        </div>
      </div>
    </StaticPageLayout>
  );
}
