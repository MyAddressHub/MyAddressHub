'use client';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About MyAddressHub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Revolutionizing Address Management for the Digital Age
          </p>
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              The Problem We Solve
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Postal address remains a linchpin of digital identity and service delivery in e-commerce, 
              finance, utilities, healthcare, and government portals. Yet users are forced to input and 
              verify their address dozens of times—often in slightly different formats—across disparate 
              systems, leading to typographical errors, delivery failures, customer support overhead, 
              and data-quality issues.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Organizations combat these errors with ad hoc scripts, manual audits, or expensive 
              third-party verification services, but these remedies scale poorly and can still expose 
              sensitive address data to multiple storage silos.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Current Challenges
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Repetitive Address Entry
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Users manually retype identical address details across multiple platforms, 
                  leading to frustration and frequent input errors.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Data Duplication
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Addresses stored in multiple silos with different format rules, 
                  causing stale records and frequent mismatches.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Security Risks
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Repeated storage of raw address strings increases probability of 
                  unauthorized access or data leaks.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Compliance Overhead
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Each service must build bespoke erasure, consent, and logging 
                  mechanisms for GDPR/CCPA compliance.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Our Solution
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              MyAddressHub is designed to overcome these challenges through a unified platform that provides:
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Single Source of Truth</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Users enter their address once, validated with geospatial APIs, and tokenized into a stable UUID 
                    that never changes even if the underlying address is updated.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Robust Security</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Hybrid cryptographic scheme combining identity-based encryption for static data at rest 
                    and the Double Ratchet algorithm for dynamic data-in-transit confidentiality.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Fine-Grained Policy Enforcement</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Semantic, consent-driven policy engine that interprets user preferences and resource metadata 
                    to enforce attribute-based access controls at runtime.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Tamper-Evident Audit Trail</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Records every create, update, and access event on a permissioned blockchain, 
                    using off-chain storage and chameleon hashes to balance immutability with regulatory requirements.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Intelligent Monitoring</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    AI-driven anomaly detectors drawing on supervised and unsupervised fraud-detection techniques 
                    to flag suspicious resolution patterns or unauthorized access attempts in real time.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Expected Benefits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                  Improved User Experience
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  Users enter their address once; downstream services receive a UUID and never prompt again—reducing 
                  data entry time by up to 80% and decreasing support tickets by an estimated 50%.
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Uniform Security Posture
                </h3>
                <p className="text-blue-700 dark:text-blue-300">
                  A shared encryption and key-management library ensures consistent confidentiality and integrity 
                  policies, reducing security misconfigurations across teams.
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">
                  Streamlined Compliance
                </h3>
                <p className="text-purple-700 dark:text-purple-300">
                  Blockchain-anchored audit logs and centralized consent records simplify GDPR/CCPA reporting, 
                  cutting compliance enforcement costs by eliminating bespoke per-service workflows.
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2">
                  Developer Productivity
                </h3>
                <p className="text-orange-700 dark:text-orange-300">
                  Service teams integrate a single SDK for validation, policy, and logging—eliminating 
                  duplicate development of common address-handling concerns.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Technology Stack
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Backend</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Python 3.10 & Django REST Framework</li>
                  <li>• PostgreSQL 15</li>
                  <li>• Redis for caching</li>
                  <li>• Celery for background jobs</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Frontend</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• React + TypeScript</li>
                  <li>• Next.js 14</li>
                  <li>• Tailwind CSS</li>
                  <li>• Mapbox/Google Places integration</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Security & Blockchain</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Charm-Crypto (IBE)</li>
                  <li>• PyNaCl (Double Ratchet)</li>
                  <li>• Hyperledger Fabric</li>
                  <li>• HSM/KMS integration</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Our Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Shovan Sarker</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Project Lead / Security Architect</p>
                <p className="text-gray-600 dark:text-gray-300">
                  Defines system and security architecture; conducts threat modeling; chairs risk reviews.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tasnova Tanzil Khan</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Project Manager / QA</p>
                <p className="text-gray-600 dark:text-gray-300">
                  Maintains schedule and backlog; defines test plans; manages QA and release readiness.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Fahim Faisal Khan</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Frontend Developer / Designer</p>
                <p className="text-gray-600 dark:text-gray-300">
                  Implements React portal; crafts wireframes and mockups; integrates geospatial autocomplete.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Shanta Saha</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Backend Developer</p>
                <p className="text-gray-600 dark:text-gray-300">
                  Builds Django microservices; writes unit/integration tests; integrates with Redis, PostgreSQL, and Fabric SDK.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Shahriar Morshed Shanto</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Frontend Developer / UX</p>
                <p className="text-gray-600 dark:text-gray-300">
                  Designs user flows; conducts usability testing; refines components for accessibility.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sajid Hasan</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Documentation / QA</p>
                <p className="text-gray-600 dark:text-gray-300">
                  Drafts requirements and architecture documentation; produces user and developer guides; assists QA.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 