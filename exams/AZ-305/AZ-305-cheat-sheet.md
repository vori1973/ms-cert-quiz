# AZ-305 Cheat Sheet — Designing Microsoft Azure Infrastructure Solutions

> **Purpose:** Fast recall for AZ-305. Organized by the **official skill areas and weightings**.
>
> **Source for skills/weights:** [Microsoft Learn AZ-305 study guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-305)
>
> **Exam level:** Expert (requires AZ-104 or equivalent experience)

---

## Table of Contents
1. [Design Identity, Governance & Monitoring Solutions (25–30%)](#identity-governance)
2. [Design Data Storage Solutions (20–25%)](#data-storage)
3. [Design Business Continuity Solutions (15–20%)](#business-continuity)
4. [Design Infrastructure Solutions (30–35%)](#infrastructure)
5. [Quick-reference: SLA numbers](#sla)
6. [Quick-reference: Key design decisions](#design-decisions)
7. [Well-Architected Framework pillars](#waf)
8. [Reference links](#refs)

---

<a name="identity-governance"></a>
## 1) Design Identity, Governance & Monitoring Solutions (25–30%)

### Identity — "Which service do I pick?" decision table

| Scenario | Solution |
|---|---|
| Federate on-premises AD with Azure (password hash sync) | **Entra ID Connect** (PHS) |
| Federate on-premises AD (pass-through auth, no cloud hash) | **Entra ID Connect** (PTA) |
| Federate on-premises AD via existing ADFS | **Entra ID Connect** (Federation) |
| Customer-facing identity (B2C / CIAM) | **Entra External ID** (customer tenants) |
| Guest / partner access (B2B) | **Entra External ID** (B2B collaboration) |
| Workload identity for Azure-hosted resources | **Managed Identity** (system- or user-assigned) |
| Workload identity for non-Azure resources (GitHub Actions, K8s) | **Workload Identity Federation** |
| Just-in-time privileged access | **PIM** (Privileged Identity Management) |
| Risk-based access control | **Conditional Access** + **Identity Protection** |
| Multi-tenant SaaS application | **Multitenant Entra application registration** |

### Identity — Know this cold

- **Managed Identity types**:
  - *System-assigned*: tied to the resource lifecycle (deleted with the resource); 1:1 mapping.
  - *User-assigned*: independent lifecycle; can be shared across multiple resources (best for shared identity).
- **PIM key concepts**:
  - *Eligible assignment*: user can activate the role when needed (JIT); requires activation approval/MFA.
  - *Active assignment*: always-on; use sparingly for break-glass accounts.
  - Access reviews: periodic recertification of role assignments.
- **Conditional Access policy anatomy**: *Assignments* (users, apps, conditions) → *Grant/Block* controls.
  - Common conditions: sign-in risk (Identity Protection), device compliance, location (named networks).
  - Common grants: require MFA, require compliant device, require Hybrid Entra join.
- **Entra ID Connect sync modes**: Password Hash Sync (PHS) > Pass-Through Auth (PTA) > Federation (ADFS).
  - PHS recommended for resilience (works even if on-premises is down).

### Governance — decision table

| Requirement | Tool |
|---|---|
| Enforce company standards on all resources | **Azure Policy** |
| Group subscriptions hierarchically | **Management Groups** |
| Deploy a governed environment (policy + RBAC + resources) as one package | **Azure Blueprints** / Deployment Stacks |
| Unified data catalog, lineage, sensitivity labels across Azure, M365, on-prem | **Microsoft Purview** |
| Cloud spend tracking, budgets, cost allocation | **Azure Cost Management + Billing** |
| Landing zone deployment at scale | **Azure Landing Zones** (CAF) |

### Governance — Know this cold

- **Management Group hierarchy** (top to bottom):
  `Root Management Group → Management Groups → Subscriptions → Resource Groups → Resources`
  - Policies and RBAC applied at a higher scope are **inherited** downward.
- **Azure Policy effects** (most restrictive first):
  - **Deny**: block non-compliant resource creation/update.
  - **Audit**: allow but flag as non-compliant; generates compliance report.
  - **AuditIfNotExists** / **DeployIfNotExists**: conditional; trigger on a related resource missing.
  - **Modify**: add/update tags or properties on compliant resources.
  - **Append**: add additional fields during creation (e.g., tags).
  - **Disabled**: policy definition exists but is inactive.
- **Initiative** = a collection of policy definitions grouped for a common goal.
- **RBAC scopes** (widest → narrowest): Management Group > Subscription > Resource Group > Resource.
  - Permissions are additive but **Deny** (from Azure Policy, not RBAC) overrides any Allow.
- **Built-in RBAC roles to know**:
  - *Owner*: full access + manage access.
  - *Contributor*: full access except manage access/role assignments.
  - *Reader*: view only.
  - *User Access Administrator*: manage access only (no resource changes).
  - *Managed Identity Operator*: assign user-assigned MIs to resources.

### Monitoring — decision table

| I need to… | Use this |
|---|---|
| Centralize all resource logs and query them with KQL | **Log Analytics workspace** (Azure Monitor Logs) |
| Monitor VM/resource metrics, set threshold alerts | **Azure Monitor Metrics** + Alert Rules |
| Application performance, dependency tracing, live metrics | **Application Insights** |
| Security posture score + compliance + threat detection recommendations | **Microsoft Defender for Cloud** |
| SIEM: correlated security events, threat hunting, SOAR playbooks | **Microsoft Sentinel** |
| Audit Azure control-plane operations (who did what) | **Activity Log** (Azure Monitor) |
| Alert DevOps team on resource health events | **Azure Service Health** |
| Unified dashboard across multiple Log Analytics workspaces | **Azure Monitor Workbooks** |

### Monitoring — Know this cold

- **Log Analytics workspace**: default retention 30 days (configurable up to 730 days); data ingestion charged by GB.
- **Alert rule signal types**: Metric (numeric, near real-time), Log (KQL query result), Activity Log (control-plane events), Resource Health.
- **Action Groups**: define who/how to notify; supports email, SMS, voice, webhook, ITSM connector, Logic App, Azure Function, Runbook.
- **Application Insights**: sampling reduces data volume without losing representativeness; Live Metrics streams real-time telemetry.
- **Defender for Cloud tiers**:
  - *Free (CSPM)*: security score, basic recommendations, no cost.
  - *Defender plans*: workload-specific protection (Defender for Servers, SQL, Storage, Containers, etc.); charged per resource.
- **Microsoft Sentinel workspace**: same Log Analytics workspace; data connectors bring in logs from Azure, M365, 3rd-party; Analytics rules detect threats; Playbooks (Logic Apps) automate responses.

### Common exam traps — Identity & Governance

- **Blueprints vs Policy**: Blueprints bundle resources + policies + RBAC assignments; Policy alone just enforces rules, does not deploy resources.
- **Audit vs Deny**: Audit logs violations but doesn't block; use Deny when you must prevent creation of non-compliant resources.
- **System- vs User-assigned MI**: choose user-assigned when multiple resources need the same identity, or when you need the identity to outlive any single resource.
- **Monitoring vs Security posture**: Defender for Cloud does BOTH recommendation/posture AND threat detection; Sentinel is the full SIEM/SOAR.
- **PIM vs Conditional Access**: PIM controls privileged role activation (JIT); Conditional Access controls every sign-in based on context/risk.

---

<a name="data-storage"></a>
## 2) Design Data Storage Solutions (20–25%)

### Storage type — "Which service do I pick?" decision table

| Requirement | Service |
|---|---|
| Unstructured blobs / objects (images, videos, backups) | **Azure Blob Storage** |
| File shares accessed via SMB or NFS | **Azure Files** |
| OS disks and data disks for VMs | **Azure Managed Disks** |
| Hadoop-compatible analytics data lake | **Azure Data Lake Storage Gen2** (ADLS Gen2) |
| Relational SQL — new cloud-native app | **Azure SQL Database** |
| SQL Server lift-and-shift (needs SQL Agent, CLR, linked servers) | **Azure SQL Managed Instance** |
| SQL Server with full OS control | **SQL Server on Azure VMs** |
| Multi-model, globally distributed NoSQL | **Azure Cosmos DB** |
| In-memory cache / session store | **Azure Cache for Redis** |
| Managed PostgreSQL | **Azure Database for PostgreSQL** (Flexible Server) |
| Managed MySQL | **Azure Database for MySQL** (Flexible Server) |
| Cloud data warehouse (columnar analytics) | **Azure Synapse Analytics** (dedicated SQL pool) |
| Spark-based big data and ML processing | **Azure Databricks** |
| Queue-based messaging (simple) | **Azure Queue Storage** |
| Message broker (enterprise) | **Azure Service Bus** |

### Blob Storage — Redundancy options

| Option | Copies | Failure protection | Read secondary? |
|---|---|---|---|
| **LRS** (Locally Redundant) | 3 (same datacenter) | Rack / server failure | No |
| **ZRS** (Zone Redundant) | 3 (3 AZs, same region) | Single zone failure | No |
| **GRS** (Geo Redundant) | 6 (3 local + 3 in paired region) | Regional failure | No |
| **GZRS** (Geo-Zone Redundant) | 6 (ZRS primary + LRS secondary) | Zone + regional failure | No |
| **RA-GRS** | Same as GRS | Regional failure | Yes (secondary) |
| **RA-GZRS** | Same as GZRS | Zone + regional failure | Yes (secondary) |

> Rule: ZRS for zone resilience within region; GRS/GZRS for regional DR; RA-* to read from secondary.

### Blob Storage — Access tiers

| Tier | Use case | Min storage duration | Retrieval latency |
|---|---|---|---|
| **Hot** | Frequently accessed | None | Milliseconds |
| **Cool** | Infrequently accessed (30+ day retention) | 30 days | Milliseconds |
| **Cold** | Rarely accessed (90+ day retention) | 90 days | Milliseconds |
| **Archive** | Long-term archival; can tolerate hours to retrieve | 180 days | Up to 15 h (standard rehydration) |

- **Lifecycle management policies**: automatically transition blobs between tiers or delete based on last-modified, last-accessed, or creation time.
- **Early deletion penalty**: deleting a blob before its minimum storage duration incurs a pro-rated charge.
- **Rehydration from Archive**: two priorities — Standard (up to 15 hours), High Priority (under 1 hour, higher cost).
- **Immutable blob storage** (WORM): Legal Hold or Time-Based Retention; protects from modification or deletion; useful for compliance (SEC 17a-4, CFTC, FINRA).

### Azure SQL options comparison

| | SQL Database | SQL Managed Instance | SQL on VMs |
|---|---|---|---|
| **SQL Agent jobs** | No (Basic/Standard); Yes (Hyperscale) | Yes | Yes |
| **Cross-database queries** | Limited (elastic queries) | Yes | Yes |
| **Linked servers** | No | Yes | Yes |
| **CLR / Service Broker** | No | Yes | Yes |
| **Network isolation** | Private endpoint | VNet injection (full subnet) | Full VNet |
| **Automatic backups** | Yes (1–35 day PITR) | Yes (1–35 day PITR) | Manual / Azure Backup |
| **Migration compatibility** | Partial (cloud-native) | ~100% SQL Server compat. | 100% |
| **Best for** | New PaaS apps | Lift-and-shift of SQL Server | Full OS/SQL control |

### Azure SQL Database — Service tiers

| Tier | Use case | Scale | Key features |
|---|---|---|---|
| **General Purpose** | Most workloads | Up to 128 vCores | Remote storage, 99.99% SLA |
| **Business Critical** | High I/O, in-memory OLTP | Up to 128 vCores | Local SSD, built-in HA replica, readable secondary |
| **Hyperscale** | Very large DBs (up to 100 TB) | Up to 128 vCores | Distributed storage, rapid scaling |
| **Serverless** | Variable/intermittent workloads | Auto-pause + resume | Pay per second of compute |
| **Elastic Pool** | Multiple DBs with varying loads | Shared eDTU or vCores | Cost savings for multi-tenant |

### Cosmos DB — Key concepts

- **APIs**: Core (SQL), MongoDB, Cassandra, Gremlin (graph), Table.
- **Consistency levels** (strongest → weakest latency/cost):
  1. **Strong** — reads guaranteed to see the latest write; linearizability.
  2. **Bounded Staleness** — reads lag behind writes by at most K versions or T seconds.
  3. **Session** *(default)* — consistent within a single session; reads own writes guaranteed.
  4. **Consistent Prefix** — reads never see out-of-order writes.
  5. **Eventual** — no ordering guarantee; lowest latency.
- **Partitioning**: partition key must have high cardinality and distribute requests evenly; hot partition = performance bottleneck.
- **RU/s (Request Units)**: normalized throughput unit; provisioned (fixed $/h) vs serverless (pay per RU consumed).
- **Multi-region writes**: enabled per account; allows writes to any region; uses conflict resolution policies.
- **SLA**: single region 99.99%; multi-region read 99.999%; multi-region write 99.999%.

### Azure Disk types

| Type | Use case | Max IOPS (single disk) | Max throughput |
|---|---|---|---|
| **Standard HDD** | Dev/test, archival | 500 | 60 MB/s |
| **Standard SSD** | Web servers, light workloads | 6,000 | 750 MB/s |
| **Premium SSD** | Production workloads | 20,000 | 900 MB/s |
| **Premium SSD v2** | High-perf workloads (configurable IOPS) | 80,000 | 1,200 MB/s |
| **Ultra Disk** | SAP HANA, top-tier databases | 160,000 | 4,000 MB/s |

> Ultra Disk and Premium SSD v2: can change IOPS/throughput without detaching; zone-redundant.

### Azure Files

- **SMB**: Windows, Linux, macOS; ports 445; Kerberos auth or storage key.
- **NFS**: Linux only; Premium tier required; VNet integration required (no public internet).
- **Azure File Sync**: sync on-premises Windows Server shares with Azure Files; supports cloud tiering (infrequently accessed files moved to Azure, stub left on-premises).
- **Tiers**: Transaction Optimized, Hot, Cool (like Blob; different from disk tiers).

### Know this cold — Data Storage

- **ADLS Gen2** = Blob Storage + **hierarchical namespace** (HNS); enables POSIX-like directory ops, ACLs, Hadoop-compatible (ABFS driver).
- **Encryption**: all Azure storage encrypted at rest by default (SSE with Microsoft-managed keys); can bring your own key (BYOK) via Azure Key Vault (customer-managed keys).
- **Storage account types**: General Purpose v2 (recommended for most), Premium Block Blob, Premium File Share, Premium Page Blob.
- **Point-in-time restore** for Blob: protects against accidental deletion/corruption; requires soft delete + versioning enabled.
- **Soft delete** for Blobs and Containers: deleted data retained for configurable days before permanent deletion.

### Common exam traps — Data Storage

- **Archive tier** is NOT immediately accessible: must rehydrate (copy to hot/cool or change tier); plan for hours of latency.
- **SQL MI vs SQL DB**: if question mentions SQL Agent, CLR, linked servers, Service Broker, or cross-database queries → **SQL MI**.
- **Cosmos DB Session consistency**: default; guarantees reads-your-own-writes within a session — great for user-centric apps.
- **ZRS vs GRS**: ZRS protects against zone failure in same region (better for HA); GRS protects against full regional failure (better for DR).
- **Elastic Pool**: best for multiple databases with varying peaks; if all databases peak simultaneously, elastic pool offers no benefit.
- **ADLS Gen2 ≠ ADLS Gen1**: Gen2 is built on Blob Storage; Gen1 is legacy; always use Gen2 for new solutions.

---

<a name="business-continuity"></a>
## 3) Design Business Continuity Solutions (15–20%)

### BC/DR — "Which service do I pick?" decision table

| Requirement | Solution |
|---|---|
| Replicate Azure VMs to another region for DR | **Azure Site Recovery (ASR)** |
| Back up Azure VMs, SQL VMs, files, blobs | **Azure Backup** |
| High availability within a region (VM-level) | **Availability Zones** (99.99% SLA) |
| High availability within a datacenter (fault/update domains) | **Availability Sets** (99.95% SLA) |
| Geo-replicate Azure SQL Database with a readable secondary | **Active geo-replication** |
| Transparent DNS failover for SQL Database / Managed Instance | **Auto-failover groups** |
| Globally distributed Cosmos DB with HA | **Multi-region accounts** (read or write to any region) |
| Geo-replicated blob/file storage with read access to secondary | **RA-GRS** / **RA-GZRS** |
| Global load balancing + instant failover for web apps | **Azure Front Door** (health probes + priority routing) |
| Global DNS-based routing with health monitoring | **Traffic Manager** |

### RPO vs RTO

| Metric | Full name | Meaning | Design implication |
|---|---|---|---|
| **RPO** | Recovery Point Objective | Maximum acceptable data loss (time since last consistent copy) | Lower RPO → more frequent sync/backup → higher cost |
| **RTO** | Recovery Time Objective | Maximum acceptable downtime (time to restore service after failure) | Lower RTO → hot/warm standby → higher cost |

### SLA reference (memorize these)

| Configuration | SLA |
|---|---|
| Single VM + Premium SSD | **99.9%** |
| Single VM + Standard SSD | 99.5% |
| Availability Set (2+ VMs) | **99.95%** |
| Availability Zones (2+ VMs in different zones) | **99.99%** |
| Azure SQL Database (General Purpose) | **99.99%** |
| Azure SQL Database (Business Critical) | **99.995%** |
| Azure App Service (Standard+) | 99.95% |
| Azure Cosmos DB (single region) | 99.999% reads / 99.99% writes |
| Azure Cosmos DB (multi-region writes) | **99.999%** |

### Availability Sets vs Availability Zones

| | Availability Sets | Availability Zones |
|---|---|---|
| Protection from | **Rack/hardware failure** (fault domains), **planned maintenance** (update domains) | **Datacenter failure** within a region |
| Scope | Single datacenter | Multiple datacenters (physically separate buildings) |
| SLA | 99.95% | 99.99% |
| Disk HA | Managed disks aligned to fault domains | ZRS disks |
| Use when | Region has no AZs, or VMs must be co-located | Region supports AZs (recommended when available) |

### Azure Backup — what can you protect?

| Workload | Solution | Vault type |
|---|---|---|
| Azure VMs (Windows/Linux) | Azure VM Backup (agent-less, snapshot-based) | Recovery Services Vault |
| SQL Server on Azure VMs | Azure Backup for SQL workload | Recovery Services Vault |
| Azure SQL Database | Built-in automated backups (full/diff/log) — not Azure Backup | Azure-managed, no vault |
| SAP HANA on Azure VMs | Azure Backup for HANA | Recovery Services Vault |
| Azure Files shares | Azure Backup (share-level snapshots) | Recovery Services Vault |
| Azure Blobs | Azure Backup for Blobs (operational or vaulted tier) | Backup Vault |
| On-premises servers/VMs | MARS agent (file-level) or MABS/DPM | Recovery Services Vault |
| Azure Kubernetes Service | Azure Backup for AKS | Backup Vault |

### Azure Site Recovery (ASR)

- Replicates entire VMs (Azure-to-Azure, VMware-to-Azure, Hyper-V-to-Azure, Physical-to-Azure).
- **RPO**: typically 30 seconds for Azure-to-Azure (crash-consistent); app-consistent snapshots configurable.
- **Recovery plans**: orchestrate failover order and automation (run scripts/runbooks between steps).
- **Test failover**: validate DR without impacting production (isolated VNet).
- **Failover types**: Test Failover (no impact), Planned Failover (no data loss), Unplanned Failover (potential data loss).
- ASR data stored in **Recovery Services Vault** (same vault as Azure Backup).

### SQL Database HA/DR

| Feature | Active geo-replication | Auto-failover groups |
|---|---|---|
| Supported services | SQL Database only | SQL Database + SQL Managed Instance |
| Secondaries | Up to 4 readable secondaries | 1 secondary (primary group + secondary group) |
| Failover trigger | Manual only | Automatic or manual |
| Connection string change? | Yes (new endpoint) | **No** — transparent DNS failover |
| Best for | Read scale-out + manual DR | Automatic DR with app transparency |

### Know this cold — Business Continuity

- **Soft delete** for Azure Backup: 14-day retention by default after deletion; prevents accidental/ransomware deletion; must be disabled before vault can be deleted.
- **Cross-region restore (CRR)**: Azure VM backup can be restored to the paired region; must be enabled on the vault.
- **Recovery Services Vault vs Backup Vault**: RSV for VMs, SQL, HANA, Files; Backup Vault for Blobs, AKS, PostgreSQL, Disks.
- **Immutable vault**: once enabled, cannot delete backup data; protects against ransomware.
- **Replication lag**: ASR uses continuous replication; Azure SQL active geo-replication uses async replication (slight lag).
- **Cosmos DB**: enabling multi-region writes means any region can accept writes; conflict resolution via last-write-wins (timestamp) or custom stored procedure.

### Common exam traps — Business Continuity

- **ASR ≠ Azure Backup**: ASR is for full VM DR (replicate to another region); Backup is for data protection (recover files/VMs from backup).
- **Availability Zones ≠ cross-region DR**: AZs protect against datacenter failure within a region; for cross-region DR, use ASR.
- **RA-GRS**: gives read access to geo-secondary, but writes always go to primary; if you need to write to secondary, you must initiate an account failover (changes primary/secondary roles).
- **Auto-failover groups provide a single read-write and one read-only listener endpoint** — app connection string never changes.
- **Active geo-replication secondary** is always readable — good for read scale-out scenarios.
- **Vault deletion**: RSV with soft-delete enabled cannot be deleted until soft-deleted items are purged.

---

<a name="infrastructure"></a>
## 4) Design Infrastructure Solutions (30–35%)

### Compute — "Which service do I pick?" decision table

| Requirement | Service |
|---|---|
| Lift-and-shift existing workloads | **Azure Virtual Machines** |
| Identical VM groups with auto-scaling | **VM Scale Sets (VMSS)** |
| Managed Kubernetes cluster | **Azure Kubernetes Service (AKS)** |
| Serverless containers (no cluster mgmt) | **Azure Container Instances (ACI)** |
| Web apps, REST APIs (PaaS, managed) | **Azure App Service** |
| Event-driven, short-lived serverless functions | **Azure Functions** |
| Microservices / container apps without K8s complexity | **Azure Container Apps** |
| HPC / large-scale parallel batch workloads | **Azure Batch** |
| Windows-based virtual desktops | **Azure Virtual Desktop (AVD)** |
| SAP HANA / large memory workloads | **M-series VMs** |
| GPU workloads (ML training, rendering) | **N-series VMs** (NC, ND, NV) |

### VM series quick reference

| Series | Optimized for |
|---|---|
| **A** | Entry-level dev/test |
| **B** | Burstable; cost-effective variable workloads |
| **D/Ds** | General purpose; balanced CPU/memory |
| **E/Es** | Memory-optimized (in-memory databases, analytics) |
| **F/Fs** | Compute-optimized (high CPU/memory ratio) |
| **G/Gs** | Large memory + fast local SSD (SAP workloads) |
| **M** | Largest memory available (SAP HANA up to 12 TB RAM) |
| **N** (NC/ND/NV) | GPU; NC=ML compute, ND=deep learning, NV=visualization |
| **H** | High-performance compute (MPI, tightly coupled HPC) |
| **L** | Storage-optimized (high disk throughput/IOPS) |

### App Service tiers

| Tier | Plan | Auto-scale | VNet integration | Deployment slots | Private endpoint |
|---|---|---|---|---|---|
| Free | F1 | No | No | 0 | No |
| Shared | D1 | No | No | 0 | No |
| Basic | B1–B3 | No | No | 0 | No |
| Standard | S1–S3 | Yes | No (legacy hybrid conn) | Up to 5 | No |
| Premium v2/v3 | P1v3–P3v3 | Yes | **Yes** (Regional VNet) | Up to 20 | Yes |
| Isolated v2 | I1v2–I3v2 | Yes | Yes (ASE — dedicated VNet) | Up to 20 | N/A (ASE is in VNet) |

- **Deployment slots**: Blue-green deployments; swap slots (production ↔ staging) with zero downtime; settings can be sticky.
- **Azure App Service Environment (ASE)**: dedicated single-tenant environment; fully injected into your VNet; no shared infrastructure.
- **Azure Functions plans**: Consumption (scale to zero, 10-min max; pay per execution), Premium (pre-warmed, VNet integration, longer timeout), Dedicated/App Service (predictable cost).

### Networking — "Which service do I pick?" decision table

| Requirement | Solution |
|---|---|
| Isolate resources in a private network | **VNet** + Subnets |
| Connect two VNets in same or different regions | **VNet Peering** (global for cross-region) |
| Connect on-premises to Azure over internet | **VPN Gateway** (Site-to-Site IPsec) |
| Connect on-premises to Azure via private dedicated link | **ExpressRoute** |
| Combine ER + VPN for failover | **ExpressRoute + VPN coexist** (VPN as backup) |
| Connect multiple sites + VNets in hub topology | **Azure Virtual WAN** |
| Secure RDP/SSH to VMs without public IP | **Azure Bastion** |
| Network-level stateful firewall (all protocols) | **Azure Firewall** |
| Protect against volumetric DDoS attacks | **Azure DDoS Protection** (Basic free; Standard paid) |
| Filter traffic at subnet / NIC level | **NSG** (Network Security Group) |
| Group VMs logically for NSG rules | **ASG** (Application Security Group) |
| Connect branches and remote users (SD-WAN) | **Azure Virtual WAN** |
| Private connectivity to Azure PaaS services | **Private Endpoints** + Private DNS zones |
| Route traffic through NVA (custom) | **User-Defined Routes (UDR)** |
| Cross-premises DNS resolution | **Azure Private DNS** resolver |

### Load balancing decision table

| Layer | Scope | Protocol | Service | WAF? |
|---|---|---|---|---|
| L4 | Regional (internal or public) | TCP / UDP | **Azure Load Balancer** (Standard) | No |
| L7 | Regional (public) | HTTP / HTTPS | **Application Gateway** | Yes |
| L7 | Global | HTTP / HTTPS | **Azure Front Door** | Yes |
| DNS | Global | Any | **Traffic Manager** | No |

> Memory hook: **"Front Door = global HTTP; App GW = regional HTTP; Load Balancer = TCP/UDP; Traffic Manager = DNS"**

### Traffic Manager routing methods

| Method | Use case |
|---|---|
| **Priority** | Primary + failover endpoint |
| **Weighted** | A/B traffic splitting, gradual rollout |
| **Performance** | Route to lowest-latency endpoint |
| **Geographic** | Data residency / compliance (route by user location) |
| **Subnet** | Route specific IP ranges to specific endpoints |
| **MultiValue** | Return multiple healthy endpoints (DNS-based) |

### Azure Front Door vs Application Gateway

| | Azure Front Door | Application Gateway |
|---|---|---|
| Scope | **Global** (anycast PoPs worldwide) | **Regional** |
| SSL termination | At PoP (near user) | At gateway |
| WAF | Yes (global policy) | Yes (regional policy) |
| URL path routing | Yes | Yes |
| Session affinity | Yes | Yes (cookie-based) |
| CDN | Yes (integrated) | No |
| WebSocket / HTTP/2 | Yes | Yes |
| Backend health probes | Yes | Yes |
| Best for | Global web apps, multi-region backends, CDN | Single-region HTTP apps, internal routing |

### VPN Gateway vs ExpressRoute

| | VPN Gateway | ExpressRoute |
|---|---|---|
| Connection type | IPsec/IKE over internet | Private dedicated circuit via provider |
| Encryption | Yes (IPsec) | Not by default (add IPsec if needed) |
| Max bandwidth | Up to 10 Gbps (VpnGw5) | Up to 100 Gbps (ER Ultra Performance) |
| Latency | Variable (internet) | Predictable, low |
| Setup time | Minutes to hours | Weeks (provider provisioning) |
| Cost | Lower | Higher |
| SLA | 99.9% (active-active) | 99.95% |
| Best for | Dev/test, remote sites, backup path | Hybrid critical workloads, compliance |

### Hub-and-spoke network topology

```
                    [On-premises]
                         |
                    [VPN/ExpressRoute]
                         |
              ┌──── HUB VNet ────────┐
              │  Azure Firewall      │
              │  Azure Bastion       │
              │  VPN/ER Gateway      │
              └──────────────────────┘
                /          |          \
         [Spoke A]    [Spoke B]    [Spoke C]
           (App)       (Data)       (Dev)
```

- Hub contains shared services; spokes contain workloads.
- VNet Peering is **non-transitive**: Spoke A cannot reach Spoke B via Hub without a UDR pointing to Azure Firewall.
- Use Azure Firewall (or NVA) in hub + UDRs in spokes to enforce east-west traffic inspection.
- **Azure Virtual WAN** automates hub-and-spoke at scale (including route management).

### Azure Bastion SKUs

| SKU | RDP/SSH | File copy | Native client | Shareable link | IP-based conn | Host scaling |
|---|---|---|---|---|---|---|
| **Basic** | Yes | No | No | No | No | No |
| **Standard** | Yes | Yes | Yes | Yes | Yes | Yes |
| **Premium** | Yes | Yes | Yes | Yes | Yes | Yes + Private-only |

### Private Endpoints vs Service Endpoints

| | Private Endpoint | Service Endpoint |
|---|---|---|
| IP address | **Private IP** from your VNet | Your VNet's public IP (traffic over MS backbone) |
| Service public endpoint | Remains accessible (unless disabled) | Remains accessible |
| DNS resolution | Private DNS zone maps service FQDN to private IP | No DNS change |
| Data exfiltration protection | Strong (traffic stays in VNet) | Weaker (can still reach other tenants) |
| Cost | Per-hour + data processing charge | Free |
| Use when | Strict isolation, compliance, multi-tenant concerns | Simple VNet routing without extra cost |

### Migration tools

| Scenario | Tool |
|---|---|
| Discover + assess on-premises VMs | **Azure Migrate** (Discovery & Assessment) |
| Replicate + migrate on-premises VMs | **Azure Migrate** (Server Migration) |
| Migrate databases to Azure SQL | **Azure Database Migration Service (DMS)** |
| Offline large-scale data transfer (no internet bandwidth) | **Azure Data Box** (~80 TB) / **Data Box Heavy** (~1 PB) |
| Online large-scale data transfer (automated pipelines) | **Azure Data Factory** / AzCopy |
| App compatibility assessment | **Azure Migrate** App & Dependency Assessment |

### AKS key concepts

- **Node pools**: System node pools (run system pods, e.g., CoreDNS); User node pools (run application workloads).
- **Networking modes**:
  - *Kubenet*: nodes get IPs from a virtual address space; NAT to VNet; simpler, fewer IPs needed.
  - *Azure CNI*: every pod gets a VNet IP; allows private endpoint access, directly addressable from VNet.
  - *Azure CNI Overlay*: pods get IPs from overlay range, not VNet; conserves VNet IP space; recommended for large clusters.
- **Cluster autoscaler**: adjusts node count based on pod resource requests.
- **Horizontal Pod Autoscaler (HPA)**: scales pod replicas based on CPU/memory metrics.
- **Azure Container Registry (ACR)**: private container image registry; ACR Tasks for automated builds.
- **Ingress controller**: routes external HTTP(S) traffic to services; typically NGINX or Application Gateway Ingress Controller (AGIC).

### Know this cold — Infrastructure

- **VMSS Flexible orchestration**: supports both homogeneous (Uniform) and mixed VM configurations; required for most new deployments.
- **Azure Functions Consumption plan**: automatically scales to zero between invocations; maximum execution timeout 10 minutes (can be extended to 60 min for Premium/Dedicated); billed per execution.
- **ExpressRoute Global Reach**: connects two on-premises networks via the Microsoft backbone (requires two ER circuits in different peering locations).
- **Azure DDoS Protection Standard**: advanced mitigation + telemetry/diagnostics; per-VNet licensing; recommended for internet-facing apps.
- **NSG flow logs**: log all IP traffic through an NSG to a storage account; used for analysis with Traffic Analytics.
- **Application Gateway WAF**: protects against OWASP Top 10 (SQLi, XSS, etc.); WAF modes: Detection (log only) vs Prevention (block).

### Common exam traps — Infrastructure

- **Traffic Manager is DNS-based**: does not proxy traffic; client connects directly to endpoint; TTL caching can delay failover (set low TTL for faster failover).
- **App Gateway WAF ≠ Azure Firewall**: WAF is for HTTP/HTTPS web apps (L7 only); Azure Firewall handles all protocols and performs L3-L7 filtering.
- **VNet Peering non-transitive**: Spoke-to-Spoke traffic requires UDR → Azure Firewall in hub; do NOT assume peering alone provides transitive connectivity.
- **Private Endpoint DNS**: must configure private DNS zone (privatelink.*) and link it to the VNet; without DNS config, FQDN still resolves to public IP.
- **AKS kubenet vs Azure CNI**: kubenet uses fewer IPs (nodes get VNet IPs, pods get overlay IPs); Azure CNI assigns VNet IPs to every pod (require more IP address space).
- **Azure Container Instances vs AKS**: ACI for quick, isolated containers (dev, burst, simple tasks); AKS for production microservices needing orchestration, auto-scaling, persistent storage.
- **App Service Isolated tier (ASE)** is always inside your VNet; Premium v2/v3 needs VNet integration enabled separately.

---

<a name="sla"></a>
## Quick Reference: SLA Numbers

| Service / Configuration | SLA |
|---|---|
| Single VM + Standard SSD | 99.5% |
| Single VM + Premium SSD | **99.9%** |
| Availability Set (2+ VMs) | **99.95%** |
| Availability Zones (2+ VMs, different zones) | **99.99%** |
| Azure SQL Database General Purpose | **99.99%** |
| Azure SQL Database Business Critical | **99.995%** |
| Azure SQL Managed Instance | **99.99%** |
| Azure App Service (Basic+) | 99.95% |
| AKS (with Availability Zones) | 99.95% |
| Azure Cosmos DB (multi-region writes) | **99.999%** |
| Azure Blob Storage ZRS | 99.9999999999% (12 nines durability) |
| Azure Load Balancer (Standard) | 99.99% |
| Azure Application Gateway | 99.95% |
| Azure Front Door | 99.99% |
| Traffic Manager | 99.99% |
| VPN Gateway (active-active) | 99.9% |
| ExpressRoute | 99.95% |

---

<a name="design-decisions"></a>
## Quick Reference: Key Design Decisions

### "VPN Gateway or ExpressRoute?"
- **VPN**: internet-based, encrypted, quick setup, up to 10 Gbps — good for dev/test and branch offices.
- **ExpressRoute**: private dedicated, not encrypted by default, high bandwidth, SLA — required for compliance, latency-sensitive, or large data movement.
- **Both**: use VPN as redundant failover path for ExpressRoute (recommended for mission-critical hybrid).

### "SQL Database vs Managed Instance vs SQL on VMs?"
- **SQL Database**: new cloud-native apps, serverless option, auto-scaling, no SQL Agent needed.
- **SQL MI**: migrating existing SQL Server with minimal changes; need SQL Agent, CLR, cross-DB queries, linked servers.
- **SQL on VMs**: need full SQL Server feature parity + OS-level control, or specific SQL Server version/edition not in MI.

### "App Service vs AKS vs Functions vs Container Apps?"
- **App Service**: simple web apps/APIs; don't want to manage containers.
- **AKS**: microservices with container orchestration; need K8s features (sidecars, custom networking, stateful sets).
- **Functions**: event-driven, short-lived tasks; scale to zero; simplest serverless.
- **Container Apps**: containerized microservices without managing K8s; supports KEDA-based scaling, Dapr.

### "Load Balancer vs App Gateway vs Front Door vs Traffic Manager?"
- **Load Balancer**: internal or public, TCP/UDP, regional L4.
- **App Gateway**: regional L7 HTTP/HTTPS with WAF; URL routing, SSL termination.
- **Front Door**: global L7 HTTP/HTTPS with WAF + CDN + anycast acceleration.
- **Traffic Manager**: global DNS-based; works with any protocol; used for geographic routing and DR failover.

### "Availability Set vs Availability Zones?"
- **Availability Zones**: always prefer when the region supports it; better SLA (99.99% vs 99.95%); protects against full datacenter failure.
- **Availability Sets**: use when region has no AZs, or when co-locating VMs for latency.

### "Private Endpoint vs Service Endpoint?"
- **Private Endpoint**: strongest isolation; private IP in your VNet; required for data exfiltration protection and compliance.
- **Service Endpoint**: simpler, free; routes traffic over MS backbone but service still has public IP.

---

<a name="waf"></a>
## Azure Well-Architected Framework (WAF) — 5 Pillars

| Pillar | Core concern | Key Azure tools |
|---|---|---|
| **Reliability** | Resilience against failures; meet RTO/RTO targets | Availability Zones, ASR, Azure Backup, Traffic Manager |
| **Security** | Protect data, systems, identities | Defender for Cloud, Sentinel, Private Endpoints, Azure Firewall, PIM |
| **Cost Optimization** | Maximize value for spend | Azure Cost Management, Reservations, Spot VMs, lifecycle policies, right-sizing |
| **Operational Excellence** | Processes for operations, deployment, monitoring | Azure Monitor, Application Insights, DevOps, Azure Automation |
| **Performance Efficiency** | Scale to meet demand efficiently | VMSS, AKS HPA, CDN, Caching (Redis), read replicas |

> AZ-305 exam frequently asks which WAF pillar or CAF principle best addresses a given scenario.

### Cloud Adoption Framework (CAF) stages

Define → Plan → Ready → Adopt (Migrate/Innovate) → Govern → Manage

- **Landing Zone**: pre-configured environment following best practices; includes networking, identity, policy, monitoring baselines.

---

<a name="refs"></a>
## Reference Links

- [AZ-305 Study Guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-305)
- [Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/)
- [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/)
- [Cloud Adoption Framework](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/)
- [Azure Reliability documentation](https://learn.microsoft.com/en-us/azure/reliability/)
- [Azure networking documentation](https://learn.microsoft.com/en-us/azure/networking/)
- [Azure Storage documentation](https://learn.microsoft.com/en-us/azure/storage/)
- [Azure Cosmos DB documentation](https://learn.microsoft.com/en-us/azure/cosmos-db/)
- [Azure SQL documentation](https://learn.microsoft.com/en-us/azure/azure-sql/)
