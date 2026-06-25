import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const TermsPage = () => {
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
          <h1 className="text-4xl font-bold mb-4">Terms & Conditions</h1>

          <p className="text-sm text-muted-foreground mb-8">
            <strong>CharzPe Legal Information</strong><br />
            App Name: CharzPe<br />
            Owner: P2P Energy Trading Private Limited<br />
            Business: Peer-to-peer energy marketplace for buying and selling energy across participating DISCOMs in India<br />
            Last Updated: June 24, 2026
          </p>

          <p className="text-base leading-relaxed mb-8">
            These Terms & Conditions govern your access to and use of the CharzPe app, website, dashboard, marketplace, and related services.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Company Information</h2>
            <p className="mb-4">
              For the purpose of these Terms & Conditions, the terms "we," "us," "our," "Company," and "CharzPe" shall mean P2P Energy Trading Private Limited, having its registered office at: FF-8O, First Floor, Block-B, Spectrum Metro Mall, Sector-75, Noida, Gautam Budh Nagar, Uttar Pradesh, 201301
            </p>
            <p className="mb-4">
              The terms "you," "your," "user," "customer," "buyer," "seller," "prosumer," "consumer," or "marketplace participant" shall mean any individual, business, housing society, institution, energy asset owner, or authorised representative accessing or using CharzPe.
            </p>
            <p>
              By accessing, registering on, or using CharzPe, you agree to be bound by these Terms & Conditions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Nature of Services</h2>
            <p className="mb-4">
              CharzPe is a digital platform that enables eligible users to participate in a peer-to-peer energy marketplace in India. The platform may allow users to buy, sell, discover, schedule, monitor, and settle energy transactions across participating DISCOMs, subject to applicable laws, regulatory approvals, DISCOM rules, metering arrangements, and grid conditions.
            </p>
            <p className="mb-4">CharzPe may provide services including:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>User onboarding for energy buyers and sellers</li>
              <li>Registration of consumers, prosumers, generators, rooftop solar owners, EV charging operators, commercial users, residential users, and other eligible participants</li>
              <li>Display of energy availability, demand, pricing, bids, offers, and transaction status</li>
              <li>Facilitation of energy transaction requests, matching, confirmations, and settlement workflows</li>
              <li>Integration with DISCOMs, meter data systems, payment gateways, energy management systems, and other authorised third-party systems</li>
              <li>Dashboards, alerts, invoices, energy statements, transaction summaries, and analytics</li>
            </ul>
            <p>
              CharzPe is a technology platform. Unless specifically authorised under applicable law, CharzPe does not itself act as a distribution licensee, transmission licensee, electricity trader, generator, or supplier of electricity.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
            <p className="mb-4">You may use CharzPe only if:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>You are legally competent to enter into contracts under Indian law</li>
              <li>You provide accurate and complete information during registration</li>
              <li>You are an eligible consumer, prosumer, generator, business, institution, housing society, or authorised representative</li>
              <li>You hold or are able to obtain all approvals, registrations, permissions, consents, net-metering approvals, open access permissions, or DISCOM approvals required for participation</li>
              <li>Your electricity connection, meter, solar plant, battery, EV charger, or energy asset is legally installed, commissioned, and compliant with applicable technical and safety standards</li>
            </ul>
            <p>
              We may reject, suspend, or terminate your account if your eligibility cannot be verified or if your participation violates applicable law, DISCOM rules, marketplace policies, or regulatory requirements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Account and Registration</h2>
            <p className="mb-4">
              To use CharzPe, you may be required to create an account and provide details including name, mobile number, email address, address, consumer number, DISCOM name, meter details, sanctioned load, payment details, KYC documents, GST details, business details, and energy asset details.
            </p>
            <p className="mb-4">
              You are responsible for maintaining the confidentiality of your login credentials, passwords, OTPs, and account access.
            </p>
            <p>
              Any activity conducted through your account will be considered authorised by you unless you immediately notify us of unauthorised access.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Buyer Obligations</h2>
            <p className="mb-4">If you use CharzPe to buy energy, you agree that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You will provide accurate demand, location, DISCOM, meter, and payment details</li>
              <li>You understand that actual delivery, accounting, adjustment, or settlement of energy may depend on grid conditions, DISCOM processes, regulatory approvals, and meter readings</li>
              <li>You will pay all applicable charges, including energy charges, platform fees, DISCOM charges, wheeling charges, banking charges, cross-subsidy surcharge, additional surcharge, taxes, duties, payment gateway charges, or any other applicable amount</li>
              <li>You will not submit false, fraudulent, speculative, or automated purchase requests</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Seller Obligations</h2>
            <p className="mb-4">If you use CharzPe to sell energy, you agree that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You have the legal right to inject, sell, assign, or transact energy from the relevant energy asset</li>
              <li>The asset details, capacity, generation profile, meter data, ownership details, and approvals submitted by you are true and complete</li>
              <li>You will comply with all applicable solar, open access, net-metering, captive, group captive, renewable energy, safety, energy accounting, and DISCOM rules</li>
              <li>You will not list energy that is already committed, sold, encumbered, or contractually restricted</li>
              <li>Any revenue displayed on CharzPe is indicative unless finally settled through the applicable billing, metering, DISCOM, or marketplace process</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. No Warranty</h2>
            <p className="mb-4">
              CharzPe is provided on an "as is" and "as available" basis.
            </p>
            <p>
              We do not guarantee uninterrupted access, error-free operation, successful transactions, specific earnings, specific savings, energy availability, grid availability, regulatory approval, or DISCOM settlement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Suspension and Termination</h2>
            <p className="mb-4">We may suspend, restrict, or terminate your account or access to CharzPe if:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>You violate these Terms & Conditions</li>
              <li>Your information cannot be verified</li>
              <li>Required approvals are denied, withdrawn, suspended, or expired</li>
              <li>Fraud, misuse, market manipulation, payment default, or security risk is suspected</li>
              <li>We are directed to do so by a DISCOM, regulator, court, government authority, or law enforcement agency</li>
            </ul>
            <p>
              Termination will not affect obligations already incurred, including payments, settlements, taxes, indemnities, and dispute-resolution obligations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Governing Law and Jurisdiction</h2>
            <p className="mb-4">
              These Terms & Conditions shall be governed by the laws of India.
            </p>
            <p>
              Subject to applicable law, courts at Noida, Uttar Pradesh shall have exclusive jurisdiction over disputes arising from or relating to CharzPe, its services, transactions, or marketplace operations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="mb-4">
              For support, queries, or grievance redressal, please contact:
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

export default TermsPage;
