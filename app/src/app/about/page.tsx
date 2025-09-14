'use client';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About MyAddressHub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Revolutionary Address Management with Blockchain Integration
          </p>
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          {/* Current Features Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              🚀 Current Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  🔐 Secure Address Storage
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  All address data is encrypted using Fernet symmetric encryption with PBKDF2 key derivation. 
                  Sensitive information is never stored in plain text.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  ⛓️ Blockchain Integration
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Address data is automatically synced to blockchain using Hardhat testnet. 
                  Smart contracts ensure data integrity and provide tamper-evident records.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  👥 Organization Management
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Support for both individual and organization users with role-based permissions. 
                  Organization admins can manage users and control access.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  🔄 Automatic Synchronization
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Celery-based background tasks automatically sync new addresses to blockchain every 5 minutes. 
                  Batch processing ensures efficient blockchain operations.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-red-500">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  📊 Real-time Monitoring
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Track sync status, blockchain transactions, and last sync timestamps. 
                  Comprehensive admin interface for monitoring system health.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-indigo-500">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  🎨 Modern UI/UX
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Built with Next.js 14, React, and Tailwind CSS. 
                  Responsive design with dark mode support and intuitive user interface.
                </p>
              </div>
            </div>
          </section>

          {/* Architecture Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              🏗️ System Architecture
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Backend Services
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Django REST API</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">PostgreSQL Database</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Redis Cache</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Celery Workers</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">RabbitMQ Broker</span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Blockchain & Security
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Hardhat Testnet</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Solidity Smart Contracts</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Fernet Encryption</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">PBKDF2 Key Derivation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">JWT Authentication</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* User Types Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              👤 User Types & Permissions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
                  Individual Users
                </h3>
                <ul className="text-blue-700 dark:text-blue-300 space-y-2 text-sm">
                  <li>• Create and manage personal addresses</li>
                  <li>• View address history and sync status</li>
                  <li>• Access to encrypted address storage</li>
                  <li>• Real-time blockchain sync monitoring</li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">
                  Organization Users
                </h3>
                <ul className="text-green-700 dark:text-green-300 space-y-2 text-sm">
                  <li>• All individual user features</li>
                  <li>• Manage organization members</li>
                  <li>• Role-based access control (Owner/Admin/Manager/Member)</li>
                  <li>• Bulk address management</li>
                  <li>• Organization-wide address sharing</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Technical Implementation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              ⚙️ Technical Implementation
            </h2>
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  🔐 Data Encryption
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  All sensitive address data is encrypted using industry-standard Fernet symmetric encryption:
                </p>
                <ul className="text-gray-600 dark:text-gray-300 space-y-1 text-sm ml-4">
                  <li>• PBKDF2 key derivation with 100,000 iterations</li>
                  <li>• AES-128 encryption in CBC mode</li>
                  <li>• HMAC-SHA256 for authentication</li>
                  <li>• Automatic key rotation support</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  ⛓️ Blockchain Integration
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Smart contract-based address storage with automatic synchronization:
                </p>
                <ul className="text-gray-600 dark:text-gray-300 space-y-1 text-sm ml-4">
                  <li>• Solidity smart contracts for data storage</li>
                  <li>• Web3.py integration for Python backend</li>
                  <li>• Automatic batch synchronization every 5 minutes</li>
                  <li>• Transaction hash and block number tracking</li>
                  <li>• IPFS integration for metadata storage</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  🔄 Background Processing
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Asynchronous task processing with Celery:
                </p>
                <ul className="text-gray-600 dark:text-gray-300 space-y-1 text-sm ml-4">
                  <li>• Celery Beat scheduler for periodic tasks</li>
                  <li>• RabbitMQ message broker</li>
                  <li>• Redis for result backend</li>
                  <li>• Automatic retry mechanisms</li>
                  <li>• Real-time task monitoring</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Technology Stack */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              🛠️ Technology Stack
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Backend</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Python 3.11</li>
                  <li>• Django 4.2</li>
                  <li>• Django REST Framework</li>
                  <li>• PostgreSQL 15</li>
                  <li>• Redis 7</li>
                  <li>• Celery 5.3</li>
                  <li>• RabbitMQ</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Frontend</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• React 18</li>
                  <li>• Next.js 14</li>
                  <li>• TypeScript</li>
                  <li>• Tailwind CSS</li>
                  <li>• JWT Authentication</li>
                  <li>• Responsive Design</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Blockchain</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Hardhat</li>
                  <li>• Solidity</li>
                  <li>• Web3.py</li>
                  <li>• Ethereum Testnet</li>
                  <li>• IPFS Integration</li>
                  <li>• Smart Contracts</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Security</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Fernet Encryption</li>
                  <li>• PBKDF2 Key Derivation</li>
                  <li>• JWT Tokens</li>
                  <li>• CORS Protection</li>
                  <li>• Input Validation</li>
                  <li>• SQL Injection Prevention</li>
                </ul>
              </div>
            </div>
          </section>

          {/* API Endpoints */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              🔌 API Endpoints
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Authentication
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">POST</span>
                    <span className="text-blue-600 dark:text-blue-400">/api/auth/register/</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">POST</span>
                    <span className="text-blue-600 dark:text-blue-400">/api/auth/login/</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">POST</span>
                    <span className="text-blue-600 dark:text-blue-400">/api/auth/change-password/</span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Address Management
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">GET</span>
                    <span className="text-green-600 dark:text-green-400">/api/addresses/</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">POST</span>
                    <span className="text-green-600 dark:text-green-400">/api/addresses/</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">PATCH</span>
                    <span className="text-green-600 dark:text-green-400">/api/addresses/:id/</span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Organization Management
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">GET</span>
                    <span className="text-purple-600 dark:text-purple-400">/api/auth/organization/users/</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">POST</span>
                    <span className="text-purple-600 dark:text-purple-400">/api/auth/organization/users/create/</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">PATCH</span>
                    <span className="text-purple-600 dark:text-purple-400">/api/auth/organization/users/:id/role/</span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Blockchain Operations
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">GET</span>
                    <span className="text-orange-600 dark:text-orange-400">/api/addresses/:id/blockchain/</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">POST</span>
                    <span className="text-orange-600 dark:text-orange-400">/api/addresses/sync/</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Deployment & DevOps */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              🚀 Deployment & DevOps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Containerization
                </h3>
                <ul className="text-gray-600 dark:text-gray-300 space-y-1 text-sm">
                  <li>• Docker & Docker Compose</li>
                  <li>• Multi-service architecture</li>
                  <li>• Environment-based configuration</li>
                  <li>• Health checks and monitoring</li>
                  <li>• Volume persistence</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Monitoring & Logging
                </h3>
                <ul className="text-gray-600 dark:text-gray-300 space-y-1 text-sm">
                  <li>• Celery Beat scheduler monitoring</li>
                  <li>• Worker task tracking</li>
                  <li>• Database query optimization</li>
                  <li>• Error logging and debugging</li>
                  <li>• Performance metrics</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Future Roadmap */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              🗺️ Future Roadmap
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
                  Phase 2: Enhanced Security
                </h3>
                <ul className="text-blue-700 dark:text-blue-300 space-y-2 text-sm">
                  <li>• Multi-signature wallet integration</li>
                  <li>• Advanced encryption algorithms</li>
                  <li>• Zero-knowledge proofs</li>
                  <li>• Hardware security modules</li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">
                  Phase 3: Scalability
                </h3>
                <ul className="text-green-700 dark:text-green-300 space-y-2 text-sm">
                  <li>• Microservices architecture</li>
                  <li>• Load balancing</li>
                  <li>• Database sharding</li>
                  <li>• CDN integration</li>
                </ul>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-3">
                  Phase 4: Advanced Features
                </h3>
                <ul className="text-purple-700 dark:text-purple-300 space-y-2 text-sm">
                  <li>• AI-powered address validation</li>
                  <li>• Geospatial analytics</li>
                  <li>• Third-party integrations</li>
                  <li>• Mobile applications</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              👥 Our Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Shovan Sarker</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Project Lead / Security Architect</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Defines system architecture, implements blockchain integration, and oversees security implementation.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tasnova Tanzil Khan</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Project Manager / QA</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Maintains project schedule, defines test plans, and manages quality assurance processes.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Fahim Faisal Khan</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Frontend Developer / Designer</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Implements React components, designs user interfaces, and ensures responsive design.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Shanta Saha</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Backend Developer</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Builds Django APIs, implements database models, and integrates with external services.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Shahriar Morshed Shanto</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Frontend Developer / UX</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Designs user flows, conducts usability testing, and refines components for accessibility.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sajid Hasan</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Documentation / QA</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Drafts technical documentation, produces user guides, and assists with quality assurance.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-lg mb-6">
                Experience the future of address management with blockchain integration and enterprise-grade security.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/auth/register" 
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Get Started
                </a>
                <a 
                  href="/features" 
                  className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Learn More
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}