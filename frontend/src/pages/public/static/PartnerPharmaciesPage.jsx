import StaticPageLayout from "../../../components/layout/StaticPageLayout";

export default function PartnerPharmaciesPage() {
  return (
    <StaticPageLayout title="Partner Pharmacies">
      <p>
        At MediReach, we believe in uplifting local businesses while providing our customers with nationwide coverage. By becoming a Partner Pharmacy, local pharmacies can access our digital user base, manage inventory dynamically, and fulfill orders effortlessly.
      </p>
      <h3 className="text-2xl font-semibold text-charcoal mt-8 mb-4">Why Partner With Us?</h3>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Expanded Reach:</strong> Sell medicines to customers beyond your physical neighborhood.</li>
        <li><strong>Digital Prescriptions:</strong> Accept and verify digital prescriptions securely through our Pharmacist Dashboard.</li>
        <li><strong>Inventory Management:</strong> Use our built-in tools to manage stock without maintaining an expensive standalone software.</li>
        <li><strong>Reliable Logistics:</strong> Let our network handle the complex last-mile delivery.</li>
      </ul>
      <p className="mt-8">
        Interested in partnering your pharmacy with MediReach? Contact our support team today to start the verification process.
      </p>
    </StaticPageLayout>
  );
}
