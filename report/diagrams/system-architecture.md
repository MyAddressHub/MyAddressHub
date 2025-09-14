# System Architecture Diagrams

## High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[Mobile App]
        C[API Client]
    end
    
    subgraph "Frontend Layer"
        D[Next.js React App]
        E[Tailwind CSS]
        F[TypeScript]
    end
    
    subgraph "API Gateway"
        G[Django REST API]
        H[JWT Authentication]
        I[API Documentation]
    end
    
    subgraph "Business Logic Layer"
        J[Address Management]
        K[User Management]
        L[Blockchain Integration]
        M[Encryption Service]
    end
    
    subgraph "Data Layer"
        N[PostgreSQL Database]
        O[Redis Cache]
        P[IPFS Storage]
    end
    
    subgraph "Blockchain Layer"
        Q[Smart Contracts]
        R[Hardhat Network]
        S[Web3 Integration]
    end
    
    subgraph "Background Processing"
        T[Celery Workers]
        U[RabbitMQ Broker]
        V[Celery Beat Scheduler]
    end
    
    A --> D
    B --> D
    C --> G
    D --> G
    G --> J
    G --> K
    J --> L
    J --> M
    L --> Q
    L --> P
    J --> N
    G --> O
    T --> U
    V --> T
```

## Microservices Architecture

```mermaid
graph TB
    subgraph "API Services"
        A1[API Service]
        A2[Worker Service]
        A3[Scheduler Service]
        A4[Blockchain Sync Service]
    end
    
    subgraph "Data Services"
        D1[PostgreSQL Database]
        D2[Redis Cache]
        D3[RabbitMQ Broker]
    end
    
    subgraph "Blockchain Services"
        B1[Hardhat Node]
        B2[IPFS Node]
        B3[Contract Deployer]
    end
    
    subgraph "Frontend Services"
        F1[Next.js App]
        F2[Nginx Proxy]
    end
    
    A1 --> D1
    A1 --> D2
    A2 --> D3
    A3 --> D3
    A4 --> B1
    A4 --> B2
    F1 --> A1
    F2 --> F1
```

## Data Flow Architecture

```mermaid
graph LR
    subgraph "Input Layer"
        A[User Input]
        B[API Requests]
        C[Batch Jobs]
    end
    
    subgraph "Processing Layer"
        D[Validation]
        E[Encryption]
        F[Blockchain Processing]
    end
    
    subgraph "Storage Layer"
        G[Database]
        H[Blockchain]
        I[IPFS]
    end
    
    subgraph "Output Layer"
        J[API Responses]
        K[Notifications]
        L[Reports]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    F --> G
    F --> H
    F --> I
    G --> J
    H --> J
    I --> J
    J --> K
    J --> L
```

## Blockchain Integration Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant D as Database
    participant B as Blockchain
    participant I as IPFS
    
    U->>F: Create Address
    F->>A: POST /addresses/
    A->>D: Save encrypted address
    A->>B: Deploy to blockchain
    B-->>A: Transaction hash
    A->>I: Store metadata
    I-->>A: IPFS hash
    A->>D: Update blockchain metadata
    A-->>F: Success response
    F-->>U: Address created
```

## Batch Synchronization Flow

```mermaid
sequenceDiagram
    participant S as Scheduler
    participant W as Worker
    participant B as Blockchain
    participant D as Database
    
    S->>W: Schedule batch sync
    W->>D: Get pending addresses
    W->>B: Batch deploy addresses
    B-->>W: Transaction results
    W->>D: Update sync status
    W->>D: Set last_synced_at
    W-->>S: Sync completed
```

## Security Architecture

```mermaid
graph TB
    subgraph "Authentication Layer"
        A1[JWT Tokens]
        A2[Refresh Tokens]
        A3[Session Management]
    end
    
    subgraph "Authorization Layer"
        B1[Role-Based Access]
        B2[Permission System]
        B3[Organization Access]
    end
    
    subgraph "Encryption Layer"
        C1[Fernet Encryption]
        C2[Key Management]
        C3[Data Decryption]
    end
    
    subgraph "Network Security"
        D1[HTTPS/TLS]
        D2[CORS Policy]
        D3[Rate Limiting]
    end
    
    A1 --> B1
    A2 --> B2
    A3 --> B3
    B1 --> C1
    B2 --> C2
    B3 --> C3
    C1 --> D1
    C2 --> D2
    C3 --> D3
```

## Database Schema

```mermaid
erDiagram
    User ||--o{ Address : owns
    User ||--o{ Profile : has
    User ||--o{ Organization : belongs_to
    Organization ||--o{ AddressPermission : grants
    Address ||--o{ AddressPermission : has
    User ||--o{ LookupRecord : performs
    
    User {
        uuid id PK
        string username
        string email
        string password_hash
        boolean is_active
        datetime date_joined
    }
    
    Profile {
        uuid id PK
        uuid user_id FK
        string user_type
        boolean is_individual
        boolean is_organization_user
        datetime created_at
    }
    
    Address {
        uuid id PK
        uuid user_id FK
        string address_name
        text address_encrypted
        text street_encrypted
        text suburb_encrypted
        text state_encrypted
        text postcode_encrypted
        boolean is_default
        boolean is_active
        boolean is_stored_on_blockchain
        datetime last_synced_at
        string blockchain_tx_hash
        bigint blockchain_block_number
        string ipfs_hash
        datetime created_at
        datetime updated_at
    }
    
    Organization {
        uuid id PK
        string name
        string description
        string contact_email
        boolean is_active
        datetime created_at
    }
    
    AddressPermission {
        uuid id PK
        uuid address_id FK
        uuid organization_id FK
        string permission_type
        datetime granted_at
        datetime expires_at
        boolean is_active
    }
    
    LookupRecord {
        uuid id PK
        uuid user_id FK
        uuid address_id FK
        string lookup_type
        datetime lookup_timestamp
        string ip_address
        string user_agent
    }
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Load Balancer"
        LB[Nginx]
    end
    
    subgraph "Application Tier"
        A1[API Instance 1]
        A2[API Instance 2]
        A3[API Instance 3]
        F1[Frontend Instance 1]
        F2[Frontend Instance 2]
    end
    
    subgraph "Data Tier"
        DB1[PostgreSQL Primary]
        DB2[PostgreSQL Replica]
        R1[Redis Cluster]
        RMQ[RabbitMQ Cluster]
    end
    
    subgraph "Blockchain Tier"
        HN[Hardhat Node]
        IPFS[IPFS Node]
    end
    
    LB --> A1
    LB --> A2
    LB --> A3
    LB --> F1
    LB --> F2
    
    A1 --> DB1
    A2 --> DB1
    A3 --> DB1
    A1 --> R1
    A2 --> R1
    A3 --> R1
    A1 --> RMQ
    A2 --> RMQ
    A3 --> RMQ
    
    A1 --> HN
    A2 --> HN
    A3 --> HN
    A1 --> IPFS
    A2 --> IPFS
    A3 --> IPFS
    
    DB1 --> DB2
```

## CI/CD Pipeline

```mermaid
graph LR
    subgraph "Source Control"
        SC[Git Repository]
    end
    
    subgraph "CI/CD Pipeline"
        T1[Test]
        T2[Build]
        T3[Deploy]
    end
    
    subgraph "Testing"
        UT[Unit Tests]
        IT[Integration Tests]
        E2E[E2E Tests]
    end
    
    subgraph "Build"
        B1[Build API Image]
        B2[Build Frontend Image]
        B3[Push to Registry]
    end
    
    subgraph "Deployment"
        D1[Deploy to Staging]
        D2[Deploy to Production]
        D3[Health Checks]
    end
    
    SC --> T1
    T1 --> UT
    T1 --> IT
    T1 --> E2E
    UT --> T2
    IT --> T2
    E2E --> T2
    T2 --> B1
    T2 --> B2
    B1 --> B3
    B2 --> B3
    B3 --> T3
    T3 --> D1
    D1 --> D2
    D2 --> D3
```
