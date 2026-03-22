import StaticPageLayout from "../../../components/layout/StaticPageLayout";

export default function PrivacyPolicyPage() {
  return (
    <StaticPageLayout title="Privacy Policy">
      <p className="text-sm text-charcoal/50 uppercase tracking-widest font-semibold mb-6">Last Updated: March 22, 2026</p>
      
      <p>
        Your privacy is critically important to us at MediReach. This Privacy Policy outlines the types of personal information we receive and collect when you use our website, and how we safeguard your information.
      </p>

      <h3 className="text-2xl font-semibold text-charcoal mt-8 mb-4">1. Information We Collect</h3>
      <p>
        We only ask for personal information when we truly need it to provide a service to you. This includes:
      </p>
      <ul className="list-disc pl-5 space-y-2 mt-2">
        <li>Contact information (email, phone number, physical address).</li>
        <li>Health information (prescriptions uploaded by you for fulfillment).</li>
        <li>Payment history and order statuses.</li>
      </ul>

      <h3 className="text-2xl font-semibold text-charcoal mt-8 mb-4">2. Medical Data & Prescriptions</h3>
      <p>
        Prescriptions submitted to MediReach are treated with the strictest confidentiality. They are only accessible by our verified, licensed partner pharmacists for the sole purpose of validating and dispensing your order. We do not sell or share your prescription data with third-party advertisers.
      </p>

      <h3 className="text-2xl font-semibold text-charcoal mt-8 mb-4">3. Data Security</h3>
      <p>
        We employ industry-standard encryption protocols (SSL/TLS) to protect data transmitted to and from our servers. Access to databases and user records is restricted to authorized personnel only. 
      </p>

      <p className="mt-8">
        If you have any questions about how we handle user data and personal information, feel free to contact us.
      </p>
    </StaticPageLayout>
  );
}
