import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const PricingPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-foreground hover:text-muted-foreground mb-8"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <div className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-4">Pricing Policy</h1>

          <p className="text-sm text-muted-foreground mb-8">
            <strong>CharzPe Legal Information</strong><br />
            App Name: CharzPe<br />
            Owner: P2P Energy Trading Private Limited<br />
            Business: Peer-to-peer energy marketplace for buying and selling energy across participating DISCOMs in India<br />
            Last Updated: June 17, 2026
          </p>

          <section className="mb-8">
            <p className="text-base leading-relaxed">
              This Pricing Policy explains how pricing, fees, charges, and payments may be displayed and applied on the CharzPe app.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Display of Pricing</h2>
            <p className="mb-4">
              Pricing will be displayed within the CharzPe app, website, transaction page, invoice, dashboard, or commercial agreement, as applicable.
            </p>
            <p>
              All pricing will generally be displayed in Indian Rupees, unless specifically stated otherwise.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Energy Pricing</h2>
            <p className="mb-4">
              Energy prices on CharzPe may vary based on one or more of the following factors:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Buyer category</li>
              <li>Seller category</li>
              <li>DISCOM area</li>
              <li>Location</li>
              <li>Time of transaction</li>
              <li>Time block or settlement period</li>
              <li>Type of energy source</li>
              <li>Demand and supply conditions</li>
              <li>Energy quantity</li>
              <li>Applicable DISCOM charges</li>
              <li>Wheeling, banking, open access, or settlement charges</li>
              <li>Regulatory charges, duties, taxes, or surcharges</li>
              <li>Marketplace rules and commercial arrangements</li>
            </ul>
            <p>
              Energy prices displayed in the app may be indicative until the transaction is confirmed and finally settled.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Platform Fees and Service Charges</h2>
            <p className="mb-4">
              CharzPe may charge platform fees, convenience fees, transaction fees, subscription fees, onboarding fees, service charges, technology fees, settlement fees, or other applicable charges.
            </p>
            <p>
              Such fees may be charged to buyers, sellers, or both, depending on the transaction type, user category, commercial arrangement, and marketplace rules.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Taxes and Statutory Charges</h2>
            <p className="mb-4">
              All applicable taxes, duties, levies, cess, GST, electricity duty, TDS, or other statutory charges shall be payable by the user, as applicable.
            </p>
            <p>
              The final invoice or settlement statement may include taxes, deductions, surcharges, regulatory charges, or other applicable amounts.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Third-Party Charges</h2>
            <p className="mb-4">
              Users may also be required to pay third-party charges, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Payment gateway charges</li>
              <li>Bank charges</li>
              <li>DISCOM charges</li>
              <li>Metering charges</li>
              <li>Open access charges</li>
              <li>Wheeling charges</li>
              <li>Banking charges</li>
              <li>Cross-subsidy surcharge</li>
              <li>Additional surcharge</li>
              <li>Regulatory or settlement charges</li>
              <li>Documentation, verification, or processing charges</li>
            </ul>
            <p>
              CharzPe is not responsible for any charges imposed by third parties, DISCOMs, banks, payment gateways, or regulators.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Price Changes</h2>
            <p className="mb-4">
              CharzPe reserves the right to change, revise, update, or withdraw prices, platform fees, service charges, and commercial terms from time to time.
            </p>
            <p>
              Any such changes will be displayed on the app, website, invoice, transaction page, or commercial agreement, as applicable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Final Settlement</h2>
            <p className="mb-4">
              The final payable or receivable amount may differ from indicative pricing displayed in the app due to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Metering corrections</li>
              <li>DISCOM settlement</li>
              <li>Regulatory charges</li>
              <li>Taxes</li>
              <li>Payment gateway charges</li>
              <li>Revised readings</li>
              <li>Transaction adjustments</li>
              <li>Other operational factors</li>
            </ul>
          </section>

          <section className="mt-8 border-t border-border pt-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="mb-4">
              For pricing queries, fee clarification, or any other assistance, please contact:
            </p>
            <div className="bg-muted p-4 rounded-lg text-sm">
              <p className="mb-2"><strong>P2P Energy Trading Private Limited</strong></p>
              <p className="mb-2">App Name: CharzPe</p>
              <p className="mb-2">Registered Office: FF-8O, First Floor, Block-B, Spectrum Metro Mall, Sector-75, Noida, Gautam Budh Nagar, Uttar Pradesh, 201301</p>
              <p className="mb-2">Email: <a href="mailto:info@charzpe.com" className="text-blue-500 hover:underline">info@charzpe.com</a></p>
              <p className="mb-2">Phone: <a href="tel:+918743081001" className="text-blue-500 hover:underline">+91 87430 81001</a></p>
              <p className="mb-2">Website: <a href="https://charzpe.com" className="text-blue-500 hover:underline">charzpe.com</a></p>
              <p className="mb-2">Grievance Officer: Sucheta Yadav</p>
              <p className="mb-2">Grievance Email: <a href="mailto:info@charzpe.com" className="text-blue-500 hover:underline">info@charzpe.com</a></p>
              <p>Working Hours: Monday to Friday, 9 AM to 6 PM</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PricingPolicyPage;
