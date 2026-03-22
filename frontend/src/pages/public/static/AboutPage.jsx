import StaticPageLayout from "../../../components/layout/StaticPageLayout";

export default function AboutPage() {
  return (
    <StaticPageLayout title="About Us">
      <p>
        Welcome to <strong>MediReach</strong>! We are Nepal's premier digital pharmacy. Our mission is to provide you with a reliable, convenient, and safe way to order authenticated medicines and health products online.
      </p>
      <p>
        Whether you are looking for over-the-counter essentials or fulfilling a prescription from your doctor, MediReach ensures that your health is always prioritized. We source our products strictly from licensed pharmacies and authentic distributors to guarantee quality and safety.
      </p>
      <h3 className="text-2xl font-semibold text-charcoal mt-8 mb-4">Our Vision</h3>
      <p>
        To revolutionize healthcare access across Nepal by bridging the gap between pharmacies and patients through technology, ensuring that no one is left without the medication they need.
      </p>
    </StaticPageLayout>
  );
}
