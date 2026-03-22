import StaticPageLayout from "../../../components/layout/StaticPageLayout";

export default function TermsOfUsePage() {
  return (
    <StaticPageLayout title="Terms of Use">
      <p className="text-sm text-charcoal/50 uppercase tracking-widest font-semibold mb-6">Last Updated: March 22, 2026</p>
      
      <p>
        By accessing the MediReach application and web platform, you agree to be bound by these Terms of Use, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
      </p>

      <h3 className="text-2xl font-semibold text-charcoal mt-8 mb-4">1. Prescription Medications</h3>
      <p>
        MediReach functions as a facilitator for placing orders to partner pharmacies. Certain medications sold on this platform are listed as "Prescription Required" (Rx). You are fully bound to provide a valid, authentic, and un-expired prescription prescribed by a certified medical practitioner to order such items. Falsifying medical documents is a punishable offense under national law.
      </p>

      <h3 className="text-2xl font-semibold text-charcoal mt-8 mb-4">2. Account Responsibility</h3>
      <p>
        You are responsible for maintaining the confidentiality of your account credentials (password and username). MediReach cannot and will not be liable for any loss or damage arising from your failure to comply with this security obligation.
      </p>

      <h3 className="text-2xl font-semibold text-charcoal mt-8 mb-4">3. Refunds and Returns</h3>
      <p>
        Due to safety regulations, dispensed medicines cannot be returned unless they were delivered past their expiration date, damaged during transit, or a wrong product was delivered. You must raise a return complaint within 24 hours of receiving the order.
      </p>
      
      <p className="mt-8">
        We reserve the right to modify these terms at any given notice, and your continued usage of the service implies acceptance of the new terms.
      </p>
    </StaticPageLayout>
  );
}
