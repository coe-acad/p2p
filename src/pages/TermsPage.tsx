import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const TermsPage = () => {
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

          <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>

          <p className="mb-4">
            These Terms & Conditions govern your access to and use of the CharzPe app, website, dashboard, marketplace, and related services.
          </p>

          <p className="mb-4">
            For the purpose of these Terms & Conditions, the terms "we," "us," "our," "Company," and "CharzPe" shall mean P2P Energy Trading Private Limited, having its registered office at: FF-8O, First Floor, Block-B, Spectrum Metro Mall, Sector-75, Noida, Gautambuddha Nagar, Uttar Pradesh, 201301
          </p>

          <p className="mb-4">
            The terms "you," "your," "user," "customer," "buyer," "seller," "prosumer," "consumer," or "marketplace participant" shall mean any individual, business, housing society, institution, energy asset owner, or authorised representative accessing or using CharzPe.
          </p>

          <p className="mb-8">
            By accessing, registering on, or using CharzPe, you agree to be bound by these Terms & Conditions.
          </p>

          <h2 className="text-lg font-semibold mb-3">1. Nature of Services</h2>
          <p className="mb-4">
            CharzPe is a digital platform that enables eligible users to participate in a peer-to-peer energy marketplace in India. The platform may allow users to buy, sell, discover, schedule, monitor, and settle energy transactions across participating DISCOMs, subject to applicable laws, regulatory approvals, DISCOM rules, metering arrangements, and grid conditions.
          </p>
          <p className="mb-3">CharzPe may provide services including:</p>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>User onboarding for energy buyers and sellers</li>
            <li>Registration of consumers, prosumers, generators, rooftop solar owners, EV charging operators, commercial users, residential users, and other eligible participants</li>
            <li>Display of energy availability, demand, pricing, bids, offers, and transaction status</li>
            <li>Facilitation of energy transaction requests, matching, confirmations, and settlement workflows</li>
            <li>Integration with DISCOMs, meter data systems, payment gateways, energy management systems, and other authorised third-party systems</li>
            <li>Dashboards, alerts, invoices, energy statements, transaction summaries, and analytics</li>
          </ul>
          <p className="mb-8">CharzPe is a technology platform. Unless specifically authorised under applicable law, CharzPe does not itself act as a distribution licensee, transmission licensee, electricity trader, generator, or supplier of electricity.</p>

          <h2 className="text-lg font-semibold mb-3">2. Eligibility</h2>
          <p className="mb-3">You may use CharzPe only if:</p>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>You are legally competent to enter into contracts under Indian law</li>
            <li>You provide accurate and complete information during registration</li>
            <li>You are an eligible consumer, prosumer, generator, business, institution, housing society, or authorised representative</li>
            <li>You hold or are able to obtain all approvals, registrations, permissions, consents, net-metering approvals, open access permissions, or DISCOM approvals required for participation</li>
            <li>Your electricity connection, meter, solar plant, battery, EV charger, or energy asset is legally installed, commissioned, and compliant with applicable technical and safety standards</li>
          </ul>
          <p className="mb-8">We may reject, suspend, or terminate your account if your eligibility cannot be verified or if your participation violates applicable law, DISCOM rules, marketplace policies, or regulatory requirements.</p>

          <h2 className="text-lg font-semibold mb-3">3. User Account and Registration</h2>
          <p className="mb-4">To use CharzPe, you may be required to create an account and provide details including name, mobile number, email address, address, consumer number, DISCOM name, meter details, sanctioned load, payment details, KYC documents, GST details, business details, and energy asset details.</p>
          <p className="mb-4">You are responsible for maintaining the confidentiality of your login credentials, passwords, OTPs, and account access.</p>
          <p className="mb-8">Any activity conducted through your account will be considered authorised by you unless you immediately notify us of unauthorised access.</p>

          <h2 className="text-lg font-semibold mb-3">4. Buyer Obligations</h2>
          <p className="mb-3">If you use CharzPe to buy energy, you agree that:</p>
          <ul className="list-disc pl-6 space-y-1 mb-8">
            <li>You will provide accurate demand, location, DISCOM, meter, and payment details</li>
            <li>You understand that actual delivery, accounting, adjustment, or settlement of energy may depend on grid conditions, DISCOM processes, regulatory approvals, and meter readings</li>
            <li>You will pay all applicable charges, including energy charges, platform fees, DISCOM charges, wheeling charges, banking charges, cross-subsidy surcharge, additional surcharge, taxes, duties, payment gateway charges, or any other applicable amount</li>
            <li>You will not submit false, fraudulent, speculative, or automated purchase requests</li>
          </ul>

          <h2 className="text-lg font-semibold mb-3">5. Seller Obligations</h2>
          <p className="mb-3">If you use CharzPe to sell energy, you agree that:</p>
          <ul className="list-disc pl-6 space-y-1 mb-8">
            <li>You have the legal right to inject, sell, assign, or transact energy from the relevant energy asset</li>
            <li>The asset details, capacity, generation profile, meter data, ownership details, and approvals submitted by you are true and complete</li>
            <li>You will comply with all applicable solar, open access, net-metering, captive, group captive, renewable energy, safety, energy accounting, and DISCOM rules</li>
            <li>You will not list energy that is already committed, sold, encumbered, or contractually restricted</li>
            <li>Any revenue displayed on CharzPe is indicative unless finally settled through the applicable billing, metering, DISCOM, or marketplace process</li>
          </ul>

          <h2 className="text-lg font-semibold mb-3">6. Marketplace Transactions</h2>
          <p className="mb-4">All bids, offers, matches, prices, transaction confirmations, and settlement outputs displayed on CharzPe may be subject to verification, technical feasibility, regulatory compliance, metering data, DISCOM approval, payment confirmation, and grid availability.</p>
          <p className="mb-3">CharzPe may cancel, reverse, modify, hold, or reject any transaction if:</p>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>The transaction violates applicable law, DISCOM rules, or regulatory directions</li>
            <li>Required approvals, metering data, or user details are unavailable, incorrect, or unverifiable</li>
            <li>There is a system error, pricing error, duplicate transaction, fraud risk, or payment failure</li>
            <li>The transaction cannot be scheduled, accounted for, adjusted, or settled due to grid, metering, DISCOM, or regulatory constraints</li>
            <li>A buyer or seller is found to be ineligible or non-compliant</li>
          </ul>
          <p className="mb-8">The final settlement of energy and money may differ from estimated values shown in the app.</p>

          <h2 className="text-lg font-semibold mb-3">7. Regulatory and DISCOM Dependency</h2>
          <p className="mb-4">Peer-to-peer energy transactions in India may be subject to central and state electricity laws, DISCOM rules, open access regulations, metering regulations, grid codes, renewable energy policies, net-metering rules, banking rules, and other regulatory requirements.</p>
          <p className="mb-8">CharzPe does not guarantee that any transaction will be approved, scheduled, wheeled, banked, netted, adjusted, settled, or recognised by any DISCOM, regulator, load despatch centre, government authority, or other competent authority.</p>

          <h2 className="text-lg font-semibold mb-3">8. Metering, Data Accuracy, and Energy Accounting</h2>
          <p className="mb-4">Energy transactions may depend on smart meter data, net meter data, generation meter data, consumer meter data, inverter data, DISCOM billing data, manual readings, or third-party data sources.</p>
          <p className="mb-3">You agree that:</p>
          <ul className="list-disc pl-6 space-y-1 mb-8">
            <li>Meter readings and energy data may be delayed, estimated, corrected, or revised</li>
            <li>App-based dashboards are for user convenience and may not be the final basis for billing or settlement</li>
            <li>Final settlement may be based on DISCOM-approved meter data, billing data, or applicable regulatory methodology</li>
            <li>CharzPe is not responsible for errors caused by faulty meters, delayed meter readings, DISCOM data issues, connectivity issues, inverter errors, API failures, or incorrect user submissions</li>
          </ul>

          <h2 className="text-lg font-semibold mb-3">9. User Conduct</h2>
          <p className="mb-3">You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1 mb-8">
            <li>Use CharzPe for illegal, fraudulent, unauthorised, or non-compliant energy transactions</li>
            <li>Misrepresent ownership, generation capacity, consumption, meter data, DISCOM approvals, or payment details</li>
            <li>Manipulate prices, bids, offers, settlements, ratings, or marketplace outcomes</li>
            <li>Interfere with app security, APIs, software, systems, or networks</li>
            <li>Use bots, scraping tools, automated bidding systems, or unauthorised integrations without prior written approval</li>
            <li>Upload malware, harmful code, false documents, or misleading information</li>
            <li>Violate intellectual property rights, privacy rights, or applicable laws</li>
          </ul>

          <h2 className="text-lg font-semibold mb-3">10. Intellectual Property</h2>
          <p className="mb-4">All content, technology, software, algorithms, designs, logos, trademarks, workflows, dashboards, databases, text, graphics, reports, interfaces, and other materials on CharzPe are owned by or licensed to P2P Energy Trading Private Limited.</p>
          <p className="mb-8">You may not copy, reproduce, reverse engineer, modify, distribute, commercially exploit, or create derivative works from CharzPe materials without our prior written consent.</p>

          <h2 className="text-lg font-semibold mb-3">11. Third-Party Services</h2>
          <p className="mb-4">CharzPe may integrate with third-party services, including DISCOM systems, payment gateways, KYC providers, cloud services, meter data providers, analytics tools, map services, communication providers, and regulatory portals.</p>
          <p className="mb-8">We are not responsible for the availability, accuracy, security, policies, charges, or actions of third-party platforms.</p>

          <h2 className="text-lg font-semibold mb-3">12. No Warranty</h2>
          <p className="mb-4">CharzPe is provided on an "as is" and "as available" basis.</p>
          <p className="mb-8">We do not guarantee uninterrupted access, error-free operation, successful transactions, specific earnings, specific savings, energy availability, grid availability, regulatory approval, or DISCOM settlement.</p>

          <h2 className="text-lg font-semibold mb-3">13. Limitation of Liability</h2>
          <p className="mb-4">To the fullest extent permitted by law, P2P Energy Trading Private Limited shall not be liable for indirect, incidental, special, consequential, punitive, or exemplary damages, including loss of profits, loss of savings, loss of energy revenue, loss of business, loss of data, regulatory penalties, DISCOM disputes, grid failures, or payment delays.</p>
          <p className="mb-8">Our total liability for any claim shall not exceed the platform fees actually paid by you to CharzPe for the specific transaction giving rise to the claim, unless a higher liability is mandatorily imposed by law.</p>

          <h2 className="text-lg font-semibold mb-3">14. Indemnity</h2>
          <p className="mb-3">You agree to indemnify and hold harmless P2P Energy Trading Private Limited, its directors, employees, officers, agents, vendors, partners, and affiliates from any claims, losses, damages, penalties, liabilities, costs, or expenses arising from:</p>
          <ul className="list-disc pl-6 space-y-1 mb-8">
            <li>Your breach of these Terms & Conditions</li>
            <li>False, incomplete, or misleading information provided by you</li>
            <li>Non-compliance with DISCOM, regulatory, tax, safety, or electricity rules</li>
            <li>Fraudulent or unauthorised transactions</li>
            <li>Disputes relating to ownership, installation, operation, or legality of your energy asset</li>
            <li>Violation of third-party rights or applicable laws</li>
          </ul>

          <h2 className="text-lg font-semibold mb-3">15. Suspension and Termination</h2>
          <p className="mb-3">We may suspend, restrict, or terminate your account or access to CharzPe if:</p>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>You violate these Terms & Conditions</li>
            <li>Your information cannot be verified</li>
            <li>Required approvals are denied, withdrawn, suspended, or expired</li>
            <li>Fraud, misuse, market manipulation, payment default, or security risk is suspected</li>
            <li>We are directed to do so by a DISCOM, regulator, court, government authority, or law enforcement agency</li>
          </ul>
          <p className="mb-8">Termination will not affect obligations already incurred, including payments, settlements, taxes, indemnities, and dispute-resolution obligations.</p>

          <h2 className="text-lg font-semibold mb-3">16. Governing Law and Jurisdiction</h2>
          <p className="mb-4">These Terms & Conditions shall be governed by the laws of India.</p>
          <p className="mb-8">Subject to applicable law, courts at Noida, Uttar Pradesh shall have exclusive jurisdiction over disputes arising from or relating to CharzPe, its services, transactions, or marketplace operations.</p>

          <h2 className="text-lg font-semibold mb-3">17. Updates to Terms</h2>
          <p className="mb-8">We may update these Terms & Conditions from time to time. Updated terms will be posted on the CharzPe app or website with the revised "Last Updated" date. Continued use of CharzPe after such update shall mean that you have accepted the revised</p>

          <div className="border-t border-border my-8 pt-8">
            <p className="font-semibold mb-1">CharzPe Legal Information</p>
            <p className="mb-1">App Name: CharzPe</p>
            <p className="mb-1">Owner: P2P Energy Trading Private Limited</p>
            <p className="mb-1">Business: Peer-to-peer energy marketplace for buying and selling energy across participating DISCOMs in India</p>
            <p className="mb-8">Last Updated: June 24, 2026</p>

            <h2 className="text-2xl font-bold mb-8">Refund & Cancellation Policy</h2>

            <p className="mb-4">Last Updated: June 17, 2026</p>
            <p className="mb-8">This Refund & Cancellation Policy applies to payments, transaction requests, platform fees, service charges, and other amounts paid through the CharzPe app or related services.</p>

            <h3 className="text-lg font-semibold mb-3">1. General Policy</h3>
            <p className="mb-8">CharzPe facilitates peer-to-peer energy transactions that may involve buyers, sellers, DISCOMs, payment gateways, metering systems, and regulatory processes. Therefore, cancellation and refund eligibility depends on the stage of the transaction, payment status, energy scheduling status, metering status, DISCOM approval status, settlement status, and applicable marketplace rules.</p>

            <h3 className="text-lg font-semibold mb-3">2. Cancellation by User</h3>
            <p className="mb-4">A user may request cancellation of a transaction only before the transaction is confirmed, matched, scheduled, submitted for DISCOM approval, or processed for settlement.</p>
            <p className="mb-8">Once a transaction has been confirmed, matched, scheduled, submitted for approval, adjusted, settled, or accounted for, cancellation may not be permitted.</p>

            <h3 className="text-lg font-semibold mb-3">3. Cancellation by CharzPe</h3>
            <p className="mb-3">CharzPe may cancel, reject, reverse, or hold a transaction if:</p>
            <ul className="list-disc pl-6 space-y-1 mb-8">
              <li>Payment fails or is not received</li>
              <li>Duplicate payment or duplicate transaction is detected</li>
              <li>Required user information is incorrect, incomplete, or unverifiable</li>
              <li>Required DISCOM, regulatory, or metering approval is not available</li>
              <li>The buyer or seller is found to be ineligible</li>
              <li>The transaction violates applicable law, DISCOM rules, regulatory directions, or marketplace policies</li>
              <li>There is a technical error, pricing error, fraud risk, system failure, or operational issue</li>
              <li>The transaction cannot be scheduled, adjusted, accounted for, or settled</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3">4. Refund Eligibility</h3>
            <p className="mb-3">Refunds may be considered in the following cases:</p>
            <ul className="list-disc pl-6 space-y-1 mb-8">
              <li>Amount has been debited but the transaction was not created</li>
              <li>Duplicate payment has been received</li>
              <li>Payment was successful but the transaction was rejected by CharzPe before confirmation</li>
              <li>Payment was successful but the transaction could not be processed due to technical failure</li>
              <li>Payment was successful but the transaction could not proceed due to regulatory, DISCOM, or metering rejection before energy accounting or settlement</li>
              <li>Any other case where CharzPe determines that a refund is valid under applicable law or marketplace policy</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3">5. Non-Refundable Cases</h3>
            <p className="mb-3">Refunds may not be provided in the following cases:</p>
            <ul className="list-disc pl-6 space-y-1 mb-8">
              <li>Energy has already been consumed, injected, scheduled, adjusted, accounted for, or settled</li>
              <li>Transaction has been successfully completed</li>
              <li>User provided incorrect, incomplete, false, or misleading details</li>
              <li>User is found ineligible after submitting incorrect information</li>
              <li>Platform fees, payment gateway charges, taxes, or third-party charges are non-refundable</li>
              <li>Transaction failed due to user negligence, wrong account details, shared OTP, device compromise, or unauthorised access caused by user conduct</li>
              <li>Cancellation request is received after the permitted cancellation window</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3">6. Refund Timeline</h3>
            <p className="mb-4">Approved refunds will be processed to the original payment method or any other permitted method within 7 to 15 working days, subject to banking, payment gateway, and settlement timelines.</p>
            <p className="mb-8">The actual credit of refund amount may depend on the user's bank, card issuer, payment gateway, or payment service provider.</p>

            <h3 className="text-lg font-semibold mb-3">7. How to Request a Refund</h3>
            <p className="mb-4">To request a refund, the user must contact CharzPe support with the following details:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Registered mobile number</li>
              <li>Registered email ID</li>
              <li>Transaction ID</li>
              <li>Payment reference number</li>
              <li>Date and amount of transaction</li>
              <li>Reason for refund request</li>
              <li>Supporting documents or screenshots, if applicable</li>
            </ul>
            <p className="mb-8">Refund requests must be sent to the contact details provided in the "Contact Us" section below.</p>

            <h2 className="text-2xl font-bold mb-8">Pricing Policy</h2>

            <p className="mb-4">Last Updated: June 17, 2026</p>
            <p className="mb-8">This Pricing Policy explains how pricing, fees, charges, and payments may be displayed and applied on the CharzPe app.</p>

            <h3 className="text-lg font-semibold mb-3">1. Display of Pricing</h3>
            <p className="mb-4">Pricing will be displayed within the CharzPe app, website, transaction page, invoice, dashboard, or commercial agreement, as applicable.</p>
            <p className="mb-8">All pricing will generally be displayed in Indian Rupees, unless specifically stated otherwise.</p>

            <h3 className="text-lg font-semibold mb-3">2. Energy Pricing</h3>
            <p className="mb-3">Energy prices on CharzPe may vary based on one or more of the following factors:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
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
            <p className="mb-8">Energy prices displayed in the app may be indicative until the transaction is confirmed and finally settled.</p>

            <h3 className="text-lg font-semibold mb-3">3. Platform Fees and Service Charges</h3>
            <p className="mb-4">CharzPe may charge platform fees, convenience fees, transaction fees, subscription fees, onboarding fees, service charges, technology fees, settlement fees, or other applicable charges.</p>
            <p className="mb-8">Such fees may be charged to buyers, sellers, or both, depending on the transaction type, user category, commercial arrangement, and marketplace rules.</p>

            <h3 className="text-lg font-semibold mb-3">4. Taxes and Statutory Charges</h3>
            <p className="mb-4">All applicable taxes, duties, levies, cess, GST, electricity duty, TDS, or other statutory charges shall be payable by the user, as applicable.</p>
            <p className="mb-8">The final invoice or settlement statement may include taxes, deductions, surcharges, regulatory charges, or other applicable amounts.</p>

            <h3 className="text-lg font-semibold mb-3">5. Third-Party Charges</h3>
            <p className="mb-3">Users may also be required to pay third-party charges, including but not limited to:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
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
            <p className="mb-8">CharzPe is not responsible for any charges imposed by third parties, DISCOMs, banks, payment gateways, or regulators.</p>

            <h3 className="text-lg font-semibold mb-3">6. Price Changes</h3>
            <p className="mb-4">CharzPe reserves the right to change, revise, update, or withdraw prices, platform fees, service charges, and commercial terms from time to time.</p>
            <p className="mb-8">Any such changes will be displayed on the app, website, invoice, transaction page, or commercial agreement, as applicable.</p>

            <h3 className="text-lg font-semibold mb-3">7. Final Settlement</h3>
            <p className="mb-8">The final payable or receivable amount may differ from indicative pricing displayed in the app due to metering corrections, DISCOM settlement, regulatory charges, taxes, payment gateway charges, revised readings, transaction adjustments, or other operational factors.</p>
          </div>

          <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
          <p className="mb-6">
            For support, privacy queries, transaction disputes, refund requests, cancellation requests, pricing queries, grievance redressal, or any other assistance, please contact:
          </p>

          <div className="bg-muted p-4 rounded-lg space-y-1 mb-8">
            <p className="font-semibold">P2P Energy Trading Private Limited</p>
            <p>App Name: CharzPe</p>
            <p>Registered Office: FF-8O, First Floor, Block-B, Spectrum Metro Mall, Sector-75, Noida, Gautambuddha Nagar, Uttar Pradesh, 201301</p>
            <p>Operating Address: FF-8O, First Floor, Block-B, Spectrum Metro Mall, Sector-75, Noida, Gautambuddha Nagar, Uttar Pradesh, 201301</p>
            <p>Email: <a href="mailto:info@charzpe.com" className="text-blue-500 hover:underline">info@charzpe.com</a></p>
            <p>Phone: <a href="tel:+918743081001" className="text-blue-500 hover:underline">+91 87430 81001</a></p>
            <p>Website: <a href="https://charzpe.com" className="text-blue-500 hover:underline">charzpe.com</a></p>
            <p>Grievance Officer: Sucheta Yadav</p>
            <p>Grievance Email: <a href="mailto:info@charzpe.com" className="text-blue-500 hover:underline">info@charzpe.com</a></p>
            <p>Working Hours: Monday to Friday, 9 AM to 6 PM</p>
          </div>

          <p className="mb-4">
            Users are requested to include their registered mobile number, email ID, transaction ID, payment reference number, and relevant screenshots or documents while raising any support request.
          </p>

          <p className="font-semibold text-center border-t border-border pt-8">
            © 2026 P2P Energy Trading Private Limited. All Rights Reserved.<br />
            CharzPe | Privacy Policy | Terms & Conditions | Refund & Cancellation Policy | Pricing Policy | Contact Us
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
