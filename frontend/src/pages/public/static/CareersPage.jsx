import StaticPageLayout from "../../../components/layout/StaticPageLayout";
import { Link } from "react-router-dom";

export default function CareersPage() {
  return (
    <StaticPageLayout title="Careers at MediReach">
      <p>
        Are you passionate about healthcare, technology, or logistics? Join the MediReach team and help us build the future of digital health in Nepal!
      </p>
      <p>
        We are always looking for talented individuals in software engineering, pharmacy operations, customer support, and delivery logistics.
      </p>
      
      <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm border border-charcoal/5">
        <h3 className="text-xl font-semibold mb-2">Current Openings</h3>
        <p className="text-charcoal/60 mb-4">We do not have any open positions currently posted online. However, we are always accepting general applications.</p>
        <p>
          Send your resume and cover letter to <a href="mailto:careers@medireach.com.np" className="text-primary hover:underline">careers@medireach.com.np</a> and we will get back to you if your profile matches a future opening!
        </p>
      </div>
    </StaticPageLayout>
  );
}
