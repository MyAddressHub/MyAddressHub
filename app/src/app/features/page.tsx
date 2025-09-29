"use client"

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-stone-950">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-stone-950 dark:text-white mb-4">
                        Features
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                        Discover the powerful features that make MyAddressHub
                        the ultimate solution for secure, compliant, and
                        efficient address management.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {/* Single Source of Truth */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                            <svg
                                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-stone-950 dark:text-white mb-3">
                            Single Source of Truth
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Users enter their address once, validated with
                            geospatial APIs, and tokenized into a stable UUID
                            that never changes even if the underlying address is
                            updated.
                        </p>
                    </div>

                    {/* Robust Security */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                            <svg
                                className="w-6 h-6 text-green-600 dark:text-green-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-stone-950 dark:text-white mb-3">
                            Robust Security
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Hybrid cryptographic scheme combining identity-based
                            encryption for static data at rest and the Double
                            Ratchet algorithm for dynamic data-in-transit
                            confidentiality.
                        </p>
                    </div>

                    {/* Policy Enforcement */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                            <svg
                                className="w-6 h-6 text-purple-600 dark:text-purple-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-stone-950 dark:text-white mb-3">
                            Fine-Grained Policy Enforcement
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Semantic, consent-driven policy engine that
                            interprets user preferences and resource metadata to
                            enforce attribute-based access controls at runtime.
                        </p>
                    </div>

                    {/* Audit Trail */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                            <svg
                                className="w-6 h-6 text-orange-600 dark:text-orange-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-stone-950 dark:text-white mb-3">
                            Tamper-Evident Audit Trail
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Records every create, update, and access event on a
                            permissioned blockchain, using off-chain storage and
                            chameleon hashes to balance immutability with
                            regulatory requirements.
                        </p>
                    </div>

                    {/* AI Monitoring */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                            <svg
                                className="w-6 h-6 text-red-600 dark:text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-stone-950 dark:text-white mb-3">
                            Intelligent Monitoring
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            AI-driven anomaly detectors drawing on supervised
                            and unsupervised fraud-detection techniques to flag
                            suspicious resolution patterns or unauthorized
                            access attempts in real time.
                        </p>
                    </div>

                    {/* Microservice Architecture */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                            <svg
                                className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-stone-950 dark:text-white mb-3">
                            Scalable Microservice Ecosystem
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            RESTful API gateway that routes UUID resolution and
                            update requests to dedicated microservices, each
                            responsible for validation, encryption, policy
                            enforcement, or auditing.
                        </p>
                    </div>
                </div>

                {/* Technical Features Section */}
                <div className="mt-16">
                    <h2 className="text-3xl font-bold text-stone-950 dark:text-white text-center mb-12">
                        Technical Capabilities
                    </h2>

                    <div className="grid gap-8 md:grid-cols-2">
                        {/* Backend Features */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                            <h3 className="text-2xl font-semibold text-stone-950 dark:text-white mb-6">
                                Backend Infrastructure
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mt-1">
                                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-stone-950 dark:text-white">
                                            Django REST Framework
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Rapid API development with built-in
                                            authentication and serialization
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mt-1">
                                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-stone-950 dark:text-white">
                                            PostgreSQL 15
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Robust relational store for
                                            normalized address records
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mt-1">
                                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-stone-950 dark:text-white">
                                            Redis Caching
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            In-memory caching and pub/sub for
                                            low-latency inter-service messaging
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mt-1">
                                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-stone-950 dark:text-white">
                                            Celery Task Queue
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Scalable background jobs for
                                            notifications and blockchain
                                            transactions
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Features */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                            <h3 className="text-2xl font-semibold text-stone-950 dark:text-white mb-6">
                                Security & Cryptography
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mt-1">
                                        <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-stone-950 dark:text-white">
                                            Charm-Crypto (IBE)
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Implements bilinear-pairing IBE for
                                            secure key distribution
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mt-1">
                                        <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-stone-950 dark:text-white">
                                            PyNaCl (Double Ratchet)
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Provides forward secrecy in transit
                                            for dynamic data
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mt-1">
                                        <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-stone-950 dark:text-white">
                                            HSM/KMS Integration
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Secure storage and automated
                                            rotation of cryptographic keys
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mt-1">
                                        <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-stone-950 dark:text-white">
                                            Hyperledger Fabric
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Permissioned blockchain for
                                            tamper-evident audit trails
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI/ML Features */}
                    <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                        <h3 className="text-2xl font-semibold text-stone-950 dark:text-white mb-6">
                            AI/ML & Monitoring
                        </h3>
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-purple-600 dark:text-purple-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                        />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-stone-950 dark:text-white mb-2">
                                    Anomaly Detection
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    AI-driven monitoring flags suspicious access
                                    patterns and unauthorized attempts
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-blue-600 dark:text-blue-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-stone-950 dark:text-white mb-2">
                                    Real-time Analytics
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Streaming analytics patterns and
                                    online-learning frameworks for live
                                    monitoring
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-green-600 dark:text-green-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-stone-950 dark:text-white mb-2">
                                    Performance Monitoring
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Netdata, ELK stack, and Sentry for
                                    comprehensive observability
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="mt-16">
                    <h2 className="text-3xl font-bold text-stone-950 dark:text-white text-center mb-12">
                        Expected Benefits
                    </h2>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">
                                Improved User Experience
                            </h3>
                            <p className="text-green-700 dark:text-green-300 text-sm">
                                Users enter their address once; downstream
                                services receive a UUID and never prompt
                                again—reducing data entry time by up to 80% and
                                decreasing support tickets by an estimated 50%.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
                                Uniform Security Posture
                            </h3>
                            <p className="text-blue-700 dark:text-blue-300 text-sm">
                                A shared encryption and key-management library
                                ensures consistent confidentiality and integrity
                                policies, reducing security misconfigurations
                                across teams.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-3">
                                Streamlined Compliance
                            </h3>
                            <p className="text-purple-700 dark:text-purple-300 text-sm">
                                Blockchain-anchored audit logs and centralized
                                consent records simplify GDPR/CCPA reporting,
                                cutting compliance enforcement costs by
                                eliminating bespoke per-service workflows.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-3">
                                Developer Productivity
                            </h3>
                            <p className="text-orange-700 dark:text-orange-300 text-sm">
                                Service teams integrate a single SDK for
                                validation, policy, and logging—eliminating
                                duplicate development of common address-handling
                                concerns.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-3">
                                Operational Efficiency
                            </h3>
                            <p className="text-red-700 dark:text-red-300 text-sm">
                                Automated address normalization and versioning
                                remove manual reconciliation tasks, leading to
                                faster go-live cycles and reduced data-quality
                                remediation.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-200 mb-3">
                                Proactive Risk Mitigation
                            </h3>
                            <p className="text-indigo-700 dark:text-indigo-300 text-sm">
                                AI-driven monitoring identifies anomalous access
                                patterns—such as sudden spikes in resolution
                                requests—enabling security teams to respond
                                before breaches occur.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
