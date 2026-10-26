import { useLocation, Link } from 'react-router-dom'
import { ShieldCheck, Lock, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import { useLanguage } from '../store/languageStore'

export default function LegalPage() {
  const { t } = useLanguage()
  const location = useLocation()
  const isTerms = location.pathname.includes('terms')

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-body text-[#212529]">
      <Navbar />

      <main id="main-content" className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 mt-24 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#003c8f] hover:underline"
          >
            <ArrowLeft size={16} /> {t('back_to_home', 'Back to Home')}
          </Link>
          <div className="inline-flex rounded border border-[#dee2e6] bg-white p-1 shadow-sm">
            <Link
              to="/privacy-policy"
              className={`px-4 py-1.5 rounded text-xs font-bold transition-colors ${
                !isTerms ? 'bg-[#003c8f] text-white' : 'text-[#495057] hover:bg-[#e3f2fd]'
              }`}
            >
              {t('privacy_policy', 'Privacy Policy')}
            </Link>
            <Link
              to="/terms-of-use"
              className={`px-4 py-1.5 rounded text-xs font-bold transition-colors ${
                isTerms ? 'bg-[#003c8f] text-white' : 'text-[#495057] hover:bg-[#e3f2fd]'
              }`}
            >
              {t('terms_of_use', 'Terms of Use')}
            </Link>
          </div>
        </div>

        {!isTerms ? (
          <div className="bg-white border border-[#dee2e6] rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-[#dee2e6] pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e3f2fd] text-[#003c8f] text-xs font-bold rounded mb-3 uppercase tracking-wider">
                <Lock size={14} /> Data Protection & Confidentiality
              </div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#003c8f] m-0">
                Privacy Policy — GeM BidVerify AI Platform
              </h1>
              <p className="text-xs text-[#6c757d] mt-1 m-0">
                Effective Date: October 2026 · Governed by Digital Personal Data Protection Act (DPDP) & GFR 2017
              </p>
            </div>

            <div className="space-y-4 text-sm text-[#495057] leading-relaxed">
              <section>
                <h2 className="font-display font-bold text-base text-[#212529] mb-1">
                  1. Strict Procurement Confidentiality
                </h2>
                <p className="m-0">
                  GeM BidVerify processes sensitive commercial, statutory, and financial bid documents strictly for
                  authorized Technical Evaluation Committee (TEC) and Procurement Officers. No active tender details,
                  bidder identities, GST/PAN numbers, or financial turnover statements are disclosed on unauthenticated
                  public pages.
                </p>
              </section>

              <section>
                <h2 className="font-display font-bold text-base text-[#212529] mb-1">
                  2. Information Collected & Processed
                </h2>
                <ul className="list-none pl-0 space-y-2 m-0">
                  {[
                    'Statutory Registration Identifiers: GSTIN, Corporate PAN, MCA21 CIN, MSME Udyam Registration, EPFO, and ESIC codes.',
                    'Financial & Technical Proofs: Audited balance sheets, CA UDIN certificates, project completion certificates, and ISO 9001:2015 accreditations.',
                    'Forensic Document Metadata: PDF creation/modification timestamps, digital signature byte ranges, and Error Level Analysis (ELA) integrity signals.',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-[#138808] flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="font-display font-bold text-base text-[#212529] mb-1">
                  3. Government Database Cross-Verification
                </h2>
                <p className="m-0">
                  Extracted identifiers are verified over encrypted channels against authorized Government of India
                  registries (GSTN, Income Tax PAN, MCA21, Udyam MSME, EPFO, ESIC, and DigiLocker). Temporary file
                  buffers created during OCR and AI inspection are automatically purged immediately after evaluation.
                </p>
              </section>

              <section>
                <h2 className="font-display font-bold text-base text-[#212529] mb-1">
                  4. Role-Based Access & Immutable Audit Logging
                </h2>
                <p className="m-0">
                  Access to bid evaluations, compliance matrices, and forensic reports requires authenticated
                  Procurement Officer or Administrator credentials. Every evaluation, status override, and export action
                  is recorded in an immutable system audit log.
                </p>
              </section>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#dee2e6] rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-[#dee2e6] pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e3f2fd] text-[#003c8f] text-xs font-bold rounded mb-3 uppercase tracking-wider">
                <FileText size={14} /> Official Governance & Usage Terms
              </div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#003c8f] m-0">
                Terms of Use — GeM BidVerify AI Platform
              </h1>
              <p className="text-xs text-[#6c757d] mt-1 m-0">
                Effective Date: October 2026 · Aligned with GeM General Terms & Conditions (GTC) & CVC Guidelines
              </p>
            </div>

            <div className="space-y-4 text-sm text-[#495057] leading-relaxed">
              <section>
                <h2 className="font-display font-bold text-base text-[#212529] mb-1">
                  1. Authorized Use Only
                </h2>
                <p className="m-0">
                  This platform is restricted to authorized Government of India Procurement Officers, Technical
                  Evaluation Committee (TEC) members, and System Administrators. Unauthorized access, automated scraping,
                  or distribution of confidential bid evaluation records is strictly prohibited under the Information
                  Technology Act, 2000.
                </p>
              </section>

              <section>
                <h2 className="font-display font-bold text-base text-[#212529] mb-1">
                  2. Document Authenticity & Anti-Fraud Compliance
                </h2>
                <p className="m-0">
                  All uploaded bid packages must be genuine PDF or DOCX documents containing mandatory statutory
                  certificates (GSTIN, PAN, Udyam, Audited Turnover, Experience, and ISO certifications). Submission of
                  forged, digitally altered, or unrelated non-bid documents triggers automatic forensic flagging and
                  disqualification recommendations under GeM General Terms & Conditions.
                </p>
              </section>

              <section>
                <h2 className="font-display font-bold text-base text-[#212529] mb-1">
                  3. Decision Support & Human-in-the-Loop Review
                </h2>
                <p className="m-0">
                  AI-generated compliance scores, risk factor breakdowns, and forensic tampering alerts serve as
                  decision-support evidence for the Technical Evaluation Committee (TEC). Final qualification or
                  rejection orders remain under the authority of the designated Procurement Officer.
                </p>
              </section>

              <section>
                <h2 className="font-display font-bold text-base text-[#212529] mb-1">
                  4. Audit Trail Integrity
                </h2>
                <p className="m-0">
                  Users agree that all document uploads, AI assistant queries, compliance verifications, and status
                  modifications are logged with timestamps for Central Vigilance Commission (CVC) and CAG audit
                  compliance.
                </p>
              </section>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-[#dee2e6] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck size={24} className="text-[#003c8f]" />
            <span className="font-display font-bold text-[#003c8f] tracking-wide">{t('gem_bidverify', 'GeM BidVerify')}</span>
          </div>
          <div className="text-sm text-[#6c757d]">{t('sih_footer', 'SIH 2026 (SIH26100) · Designed for Government of India')}</div>
          <div className="flex gap-4 text-sm text-[#003c8f] font-bold">
            <Link to="/privacy-policy" className="hover:underline">{t('privacy_policy', 'Privacy Policy')}</Link>
            <Link to="/terms-of-use" className="hover:underline">{t('terms_of_use', 'Terms of Use')}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
