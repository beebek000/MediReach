import StaticPageLayout from "../../../components/layout/StaticPageLayout";

export default function DeliveryInfoPage() {
  return (
    <StaticPageLayout title="Delivery Information">
      <p>
        MediReach ensures swift and safe delivery of your medicines across Nepal. We handle our packaging with care to maintain the efficacy of temperature-sensitive and fragile health products.
      </p>
      
      <h3 className="text-2xl font-semibold text-charcoal mt-8 mb-4">Delivery Zones & Times</h3>
      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-charcoal/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-charcoal/5 border-b border-charcoal/10">
              <th className="p-4 font-semibold text-charcoal">Region</th>
              <th className="p-4 font-semibold text-charcoal">Estimated Time</th>
              <th className="p-4 font-semibold text-charcoal">Fee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/5">
            <tr>
              <td className="p-4">Kathmandu Valley (KTM, Lalitpur, Bhaktapur)</td>
              <td className="p-4">Same Day (Within 4 hours)</td>
              <td className="p-4">NPR 50</td>
            </tr>
            <tr>
              <td className="p-4">Major Cities (Pokhara, Itahari, Biratnagar, etc.)</td>
              <td className="p-4">Next Day (Within 24 hours)</td>
              <td className="p-4">NPR 100</td>
            </tr>
            <tr>
              <td className="p-4">Outside Major Cities</td>
              <td className="p-4">2-4 Business Days</td>
              <td className="p-4">NPR 150</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-sm text-charcoal/60">
        * Please note that prescription verification may add additional processing time. Once verified, your order will be dispatched following the timeline above.
      </p>
    </StaticPageLayout>
  );
}
