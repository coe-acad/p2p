import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-foreground hover:text-muted-foreground mb-8"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <div className="prose prose-invert max-w-none text-xs leading-relaxed">
          <div className="mb-8">
            <p className="font-semibold mb-1">CharzPe Legal Information</p>
            <p className="mb-1">App Name: CharzPe</p>
            <p className="mb-1">Owner: P2P Energy Trading Private Limited</p>
            <p className="mb-1">Business: Peer-to-peer energy marketplace for buying and selling energy across participating DISCOMs in India</p>
            <p>Last Updated: June 24, 2026</p>
          </div>

          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

          <p className="mb-4">
            This Privacy Policy explains how P2P Energy Trading Private Limited, owner and operator of the CharzPe app, collects, uses, stores, shares, and protects user information.
          </p>

          <p className="mb-4">
            For the purpose of this Privacy Policy, the terms "we," "us," "our," "Company," and "CharzPe" shall mean P2P Energy Trading Private Limited. The terms "you," "your," "user," "customer," "buyer," "seller," "prosumer," or "marketplace participant" shall mean any individual, business, institution, housing society, energy asset owner, or authorised representative using the CharzPe app or services.
          </p>

          <p className="mb-8">
            By accessing, registering on, or using the CharzPe app, website, dashboard, or related services, you agree to the collection and use of your information in accordance with this Privacy Policy.
          </p>

          <h2 className="text-lg font-semibold mb-4">1. Information We Collect</h2>
          <p className="mb-4">We may collect the following information from users:</p>

          <h3 className="text-base font-semibold mb-2">Personal and Contact Information</h3>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>Name</li>
            <li>Mobile number</li>
            <li>Email address</li>
            <li>Residential, commercial, or business address</li>
            <li>Identity and KYC details</li>
            <li>PAN, GSTIN, business registration details, where applicable</li>
            <li>Bank account, UPI, or payment-related information</li>
          </ul>

          <h3 className="text-base font-semibold mb-2">Electricity and Energy-Related Information</h3>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>DISCOM name</li>
            <li>Consumer number</li>
            <li>Meter number</li>
            <li>Meter category</li>
            <li>Sanctioned load</li>
            <li>Connection type</li>
            <li>Electricity consumption data</li>
            <li>Energy generation data</li>
            <li>Rooftop solar, battery, EV charger, or other energy asset details</li>
            <li>Energy injection, drawal, settlement, and billing data</li>
            <li>Transaction history, bids, offers, invoices, payouts, and marketplace activity</li>
          </ul>

          <h3 className="text-base font-semibold mb-2">Device and Technical Information</h3>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>Device ID</li>
            <li>IP address</li>
            <li>App version</li>
            <li>Browser type</li>
            <li>Operating system</li>
            <li>Location data, where permitted</li>
            <li>Usage logs, cookies, analytics identifiers, and app activity data</li>
          </ul>

          <h3 className="text-base font-semibold mb-2">Support and Communication Information</h3>
          <ul className="list-disc pl-6 space-y-1 mb-8">
            <li>Customer support requests</li>
            <li>Complaints</li>
            <li>Feedback</li>
            <li>Emails, calls, WhatsApp messages, chatbot interactions, and other communications with us</li>
          </ul>

          <h2 className="text-lg font-semibold mb-3">2. How We Use Your Information</h2>
          <p className="mb-3">We may use your information for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-1 mb-8">
            <li>To create, verify, and manage your CharzPe account</li>
            <li>To onboard users for buying or selling energy on the CharzPe marketplace</li>
            <li>To verify your DISCOM connection, meter details, identity, payment details, and eligibility</li>
            <li>To facilitate energy discovery, bids, offers, matching, scheduling, settlement, invoicing, and reporting</li>
            <li>To process payments, refunds, seller payouts, invoices, taxes, and transaction records</li>
            <li>To provide dashboards, usage insights, energy reports, generation reports, alerts, and transaction summaries</li>
            <li>To communicate service updates, transaction updates, support responses, and regulatory or operational notices</li>
            <li>To prevent fraud, unauthorised access, misuse, market manipulation, or security incidents</li>
            <li>To comply with applicable law, regulatory requirements, DISCOM processes, tax obligations, audit requirements, or directions from competent authorities</li>
            <li>To improve our services, app performance, user experience, marketplace operations, and product features</li>
          </ul>

          <h2 className="text-lg font-semibold mb-3">3. Sharing of Information</h2>
          <p className="mb-3">We may share your information with the following parties, only as required for providing our services, complying with law, or operating the marketplace:</p>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>DISCOMs and electricity distribution companies</li>
            <li>Electricity regulators, government authorities, and statutory bodies</li>
            <li>Load despatch centres, settlement agencies, or energy accounting agencies</li>
            <li>Payment gateways, banks, escrow partners, and financial institutions</li>
            <li>KYC, identity verification, and document verification service providers</li>
            <li>Metering, IoT, inverter, solar, battery, EV charging, and energy data service providers</li>
            <li>Cloud hosting, analytics, communication, CRM, and customer-support vendors</li>
            <li>Legal, tax, audit, accounting, and compliance advisors</li>
            <li>Courts, regulators, law enforcement agencies, or government authorities, where required by law</li>
          </ul>
          <p className="mb-8">We do not sell your personal data to advertisers.</p>

          <h2 className="text-lg font-semibold mb-3">4. Data Retention</h2>
          <p className="mb-4">
            We retain your information for as long as necessary to provide CharzPe services, complete energy transactions, comply with legal and regulatory obligations, resolve disputes, maintain tax and accounting records, prevent fraud, and enforce our agreements.
          </p>
          <p className="mb-8">
            Energy transaction records, invoices, payment records, KYC records, metering data, and settlement records may be retained for longer periods where required under applicable law, DISCOM rules, regulatory directions, tax laws, or audit requirements.
          </p>

          <h2 className="text-lg font-semibold mb-3">5. Data Security</h2>
          <p className="mb-4">
            We use reasonable technical and organisational safeguards to protect your information from unauthorised access, misuse, loss, alteration, or disclosure.
          </p>
          <p className="mb-8">
            However, no digital platform, internet transmission, storage system, payment system, or communication channel is completely secure. Users are responsible for keeping their devices, login credentials, passwords, and OTPs secure.
          </p>

          <h2 className="text-lg font-semibold mb-3">6. User Rights</h2>
          <p className="mb-3">Subject to applicable law, you may request to:</p>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>Access your personal information</li>
            <li>Correct inaccurate or incomplete information</li>
            <li>Withdraw consent for optional processing</li>
            <li>Request deletion of personal information, subject to legal, regulatory, contractual, settlement, and audit requirements</li>
            <li>Raise a grievance regarding processing of your personal data</li>
          </ul>
          <p className="mb-8">
            To exercise these rights, you may contact us using the details provided in the "Contact Us" section below.
          </p>

          <h2 className="text-lg font-semibold mb-3">7. Cookies and Analytics</h2>
          <p className="mb-4">
            The CharzPe website and app may use cookies, SDKs, pixels, analytics tools, and similar technologies to improve user experience, understand app usage, enhance security, and improve our services.
          </p>
          <p className="mb-8">
            You may disable cookies through your browser or device settings, but some features of the app or website may not function properly.
          </p>

          <h2 className="text-lg font-semibold mb-3">8. Changes to Privacy Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. The updated Privacy Policy will be posted on the CharzPe app or website with the revised "Last Updated" date.
          </p>
          <p className="mb-8">
            Continued use of CharzPe after any update shall mean that you have accepted the updated Privacy Policy.
          </p>

          <div className="border-t border-border mt-8 pt-8">
            <h2 className="text-lg font-semibold mb-4">Contact Us</h2>
            <p className="mb-4">
              For support, privacy queries, transaction disputes, refund requests, cancellation requests, pricing queries, grievance redressal, or any other assistance, please contact:
            </p>
            <div className="bg-muted p-4 rounded-lg space-y-1">
              <p className="font-semibold">P2P Energy Trading Private Limited</p>
              <p>App Name: CharzPe</p>
              <p>Registered Office: FF-8O, First Floor, Block-B, Spectrum Metro Mall, Sector-75, Noida, Gautam Budh Nagar, Uttar Pradesh, 201301</p>
              <p>Operating Address: FF-8O, First Floor, Block-B, Spectrum Metro Mall, Sector-75, Noida, Gautam Budh Nagar, Uttar Pradesh, 201301</p>
              <p>Email: <a href="mailto:info@charzpe.com" className="text-blue-500 hover:underline">info@charzpe.com</a></p>
              <p>Phone: <a href="tel:+918743081001" className="text-blue-500 hover:underline">+91 87430 81001</a></p>
              <p>Website: <a href="https://charzpe.com" className="text-blue-500 hover:underline">charzpe.com</a></p>
              <p>Grievance Officer: Sucheta Yadav</p>
              <p>Grievance Email: <a href="mailto:info@charzpe.com" className="text-blue-500 hover:underline">info@charzpe.com</a></p>
              <p>Working Hours: Monday to Friday, 9 AM to 6 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
