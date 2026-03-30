# AZ-104 Microsoft Azure Administrator — Cheat Sheet

> **Purpose:** Fast recall for AZ-104. Organized by the **official skill areas and weightings**.
>
> **Source:** [Microsoft Learn AZ-104 study guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104)
>
> **⚠️ Volatile facts:** Items marked ⚠️ (pricing tiers, SKU feature boundaries) can change as Azure evolves. Treat them as a starting point and verify against current Microsoft documentation before the exam.

---

## Exam Snapshot

- **Exam Code:** AZ-104
- **Duration:** 100 minutes
- **Questions:** ~40–60 (MCQ, multi-select, drag-and-drop, scenario-based)
- **Passing Score:** 700 / 1000
- **Focus:** Day-to-day Azure administration — identity, governance, storage, compute, networking, monitoring

---

## Domain Weights at a Glance

| # | Domain | Weight |
|---|---|---|
| 1 | Manage Azure Identities and Governance | 15–20% |
| 2 | Implement and Manage Storage | 15–20% |
| 3 | Deploy and Manage Azure Compute Resources | 20–25% |
| 4 | Implement and Manage Virtual Networking | 15–20% |
| 5 | Monitor and Maintain Azure Resources | 10–15% |

---

## Table of Contents

1. [Manage Azure Identities and Governance (15–20%)](#1-manage-azure-identities-and-governance-1520)
2. [Implement and Manage Storage (15–20%)](#2-implement-and-manage-storage-1520)
3. [Deploy and Manage Azure Compute Resources (20–25%)](#3-deploy-and-manage-azure-compute-resources-2025)
4. [Implement and Manage Virtual Networking (15–20%)](#4-implement-and-manage-virtual-networking-1520) — incl. UDR, NAT Gateway, ASG, Private DNS patterns
5. [Monitor and Maintain Azure Resources (10–15%)](#5-monitor-and-maintain-azure-resources-1015)
6. [Quick-Reference Tables](#6-quick-reference-tables)
7. [Common Exam Traps](#7-common-exam-traps)

---

## 1. Manage Azure Identities and Governance (15–20%)

### Microsoft Entra ID (formerly Azure AD)

| Concept | Key Detail |
|---|---|
| **Tenant** | Dedicated Entra ID instance per organization |
| **User types** | Member (internal) vs. Guest (B2B external) |
| **Groups** | Security groups (resource access) vs. Microsoft 365 groups (collaboration + resources) |
| **Group membership** | Assigned (manual) or Dynamic (attribute-based query) |
| **Administrative Units** | Scope admin permissions to a subset of users/groups/devices |
| **Bulk operations** | CSV upload for bulk create/invite/delete |

### Entra ID Licensing Tiers

| Feature | Free | P1 | P2 |
|---|---|---|---|
| Basic user/group management | ✅ | ✅ | ✅ |
| Self-service password reset (SSPR) | Cloud-only | ✅ | ✅ |
| Conditional Access | ❌ | ✅ | ✅ |
| Identity Protection | ❌ | ❌ | ✅ |
| Privileged Identity Management (PIM) | ❌ | ❌ | ✅ |
| Access Reviews | ❌ | ❌ | ✅ |

**SSPR Rules:**
- **Guest users cannot use SSPR** — only Member users can reset passwords via SSPR
- On-premises synced users (AD DS → Entra Connect) need **password writeback** enabled to reset their on-prem password via SSPR
- Cloud-only users: SSPR works with Free tier; on-prem synced users: require P1/P2 with writeback

### Role-Based Access Control (RBAC)

- **Scope levels** (broadest → narrowest): Management Group → Subscription → Resource Group → Resource
- Permissions **inherit downward** — role assigned at subscription applies to all resource groups within
- **Assignment = Security Principal + Role Definition + Scope**

| Built-in Role | What It Can Do |
|---|---|
| **Owner** | Full access including managing access (assign roles) |
| **Contributor** | Full resource management; **cannot** assign roles |
| **Reader** | View resources only |
| **User Access Administrator** | Manage role assignments only |
| **Cost Management Contributor** | View costs + manage budgets and exports; **cannot** modify resources |
| **Billing Reader** | Read-only access to billing info; **cannot** manage budgets |

✅ **Exam Tip:** "Least privilege" → always pick the most restrictive role that satisfies the requirement.

### Azure Policy

- **Policy Definition** → single rule (e.g., "allowed VM SKUs")
- **Initiative (Policy Set)** → collection of policy definitions
- **Assignment** → apply policy/initiative to a scope
- **Effect types:**
  - `Deny` — block non-compliant resource creation
  - `Audit` — log but allow
  - `AuditIfNotExists` — audit if a related resource is missing
  - `DeployIfNotExists` — auto-remediate by deploying a related resource
  - `Append` — add fields to the request
  - `Modify` — add/replace/remove tags or properties
- **Remediation tasks** — apply policy to existing non-compliant resources
- Policies do **not** apply retroactively unless a remediation task is run

### Management Groups

- Organizes multiple subscriptions
- Up to **6 levels** of hierarchy (excluding root)
- Root Management Group contains all subscriptions by default
- RBAC and policies applied at management group level cascade to all subscriptions below

### Subscriptions & Cost Management

- Each subscription has limits (quotas); request increases via support tickets
- **Azure Cost Management + Billing** — budgets, cost alerts, spending analysis
- **Budget alerts** — notify when spending reaches a % threshold; can trigger action groups
- **Tags** — key-value pairs for cost allocation, governance, automation; not inherited by resources (use policy to enforce)

### Azure Resource Manager (ARM)

- All Azure operations go through ARM (REST API layer)
- **ARM templates (JSON)** and **Bicep** — declarative IaC; idempotent
- **Locks:**
  - `ReadOnly` — no changes allowed (can still read)
  - `Delete` — cannot delete (but can modify)
  - Locks cascade to child resources; applied at resource group or resource level

---

## 2. Implement and Manage Storage (15–20%)

### Storage Account Types

| Type | Supported Services | Use Case |
|---|---|---|
| **Standard GPv2** | Blob, File, Queue, Table | Most scenarios (recommended) |
| **Premium Block Blob** | Block blobs only | High-throughput, low-latency workloads |
| **Premium File Shares** | Azure Files only | High-performance file shares |
| **Premium Page Blob** | Page blobs only | VM disks (unmanaged) |

### Redundancy Options

| SKU | Copies | Location | RPO |
|---|---|---|---|
| **LRS** | 3 copies | Same datacenter | Datacenter failure loses data |
| **ZRS** | 3 copies | 3 AZs in same region | Zone failure protected |
| **GRS** | 6 copies | Primary + secondary region (LRS each) | Region failure protected; secondary read-only only after failover |
| **GZRS** | 6 copies | 3 AZs primary + secondary region | Zone + region failure protected |
| **RA-GRS / RA-GZRS** | Same as GRS/GZRS | + Read access to secondary **always** | Best RTO for reads |

✅ **Exam Tip:** If asked for read access to secondary region **without failover** → RA-GRS or RA-GZRS.

### Blob Storage Access Tiers

| Tier | Storage Cost | Access Cost | Minimum Retention | Use Case |
|---|---|---|---|---|
| **Hot** | Highest | Lowest | None | Frequently accessed |
| **Cool** | Lower | Higher | 30 days | Infrequently accessed |
| **Cold** | Lower still | Higher still | 90 days | Rarely accessed |
| **Archive** | Lowest | Highest | 180 days | Long-term; offline; **must rehydrate** before reading |

- **Lifecycle management policies** — auto-move blobs between tiers or delete based on age
- **Rehydration** from Archive: `Standard` (up to 15 hours) or `High Priority` (< 1 hour, higher cost)

### Blob Types

| Type | Description | Use Case |
|---|---|---|
| **Block Blob** | Blocks up to 4000 MiB each | Files, images, videos |
| **Append Blob** | Optimized for append operations | Log files |
| **Page Blob** | 512-byte pages, random R/W | VM disks (unmanaged) |

### Blob Access & Security

- **Access levels (container):** Private, Blob (anonymous blob read), Container (anonymous container + blob read)
- **Shared Access Signature (SAS):** time-limited, scoped permissions URI
  - **Account SAS** — multiple services
  - **Service SAS** — single service
  - **User Delegation SAS** — backed by Entra ID credentials (most secure)
- **Stored Access Policy** — server-side control over SAS; revoke by deleting the policy
- **Encryption:** All data encrypted at rest (SSE with Microsoft-managed keys by default); optionally customer-managed keys (CMK) via Key Vault

### Azure Files

- SMB (2.1, 3.0, 3.1.1) and NFS 4.1 shares
- **Azure File Sync** — sync on-premises Windows Server with Azure Files; supports tiered caching
  - Components: Storage Sync Service → Sync Group → Cloud Endpoint (Azure file share) + Server Endpoint(s)
- Auth: Storage account key, Entra ID (Kerberos), or on-premises AD DS

### Storage Access & Networking

- **Private endpoints** — expose storage over a private IP within your VNet
- **Service endpoints** — route traffic to storage over Azure backbone but still uses public IP
- **Firewall rules** — whitelist specific VNets or IP ranges; default deny blocks all public access
- **Trusted Azure services** — when explicitly configured, selected Microsoft services (e.g., Azure Backup, Site Recovery) can bypass storage firewall rules; not all Azure services qualify and the supported list can change — verify per-service support in current docs

### Azure Import/Export & Data Migration

| Tool | Use Case |
|---|---|
| **AzCopy** | CLI; fast blob/file copy; supports sync |
| **Azure Storage Explorer** | GUI; cross-platform; manage blobs, files, queues, tables |
| **Azure Data Box** | Physical device for offline bulk transfer (up to 80 TB per device) |
| **Data Box Disk** | SSD devices (up to 35 TB total) |
| **Azure Migrate** | Assess + migrate on-premises VMs, DBs, web apps |

---

## 3. Deploy and Manage Azure Compute Resources (20–25%)

### Virtual Machines

#### VM Size Families

| Series | Purpose |
|---|---|
| **B** | Burstable, low cost, dev/test |
| **D/Dsv** | General purpose, balanced CPU/memory |
| **E/Esv** | Memory optimized |
| **F/Fsv** | Compute optimized |
| **L/Lsv** | Storage optimized (high local disk I/O) |
| **M** | Memory-heavy (SAP HANA) |
| **N (NC/ND/NV)** | GPU-enabled (ML/rendering) |

#### VM Availability

| Option | SLA | Description |
|---|---|---|
| **Single VM with Premium SSD** | 99.9% | Basic |
| **Availability Set** | 99.95% | Spreads VMs across fault domains (FD) and update domains (UD) within a datacenter |
| **Availability Zone** | 99.99% | Spreads VMs across physically separate datacenters within a region |
| **Virtual Machine Scale Set (VMSS)** | 99.99% (with zones) | Auto-scale group of identical VMs |

- **Fault Domain (FD):** Shared physical rack (power + network); up to 3 FDs per availability set
- **Update Domain (UD):** Group rebooted together during planned maintenance; up to 20 UDs

#### VM Disks

| Type | Use | Max IOPS |
|---|---|---|
| **OS Disk** | Boot volume (managed disk) | — |
| **Data Disk** | Additional persistent storage | Up to 80,000 IOPS (Ultra) |
| **Temp Disk** | Ephemeral; **data lost on deallocate/reboot** | — |

- **Managed disks:** Azure manages storage account; recommended
- **Disk SKUs:** HDD Standard → SSD Standard → SSD Premium → Ultra Disk
- **Azure Disk Encryption (ADE):** BitLocker (Windows) / dm-crypt (Linux) + Key Vault

#### VM Networking

- Each VM gets 1+ NICs; each NIC in a subnet
- Public IP: Basic (static/dynamic, no zone) vs. Standard (static only, zone-redundant, requires NSG)
- **VM Extensions:** post-deployment config (Custom Script Extension, DSC, Azure Monitor Agent)

#### VM Scale Sets (VMSS)

- **Orchestration modes:**
  - `Flexible` — mix VM types, recommended for most workloads
  - `Uniform` — identical VMs, better for stateless high-scale
- **Scaling policies:** CPU%, memory%, custom metrics, schedule
- **Cooldown period** — time between scale events (default 5 min)
- **Scale-in policy** — which VMs removed first (default: OldestVM)

### Azure App Service

- PaaS for web apps; no VM management needed
- **App Service Plan** defines region, instance size, and scaling; VMs are shared across apps in the same plan
- **SKUs:**
  - Free/Shared — no SLA, shared infrastructure
  - Basic — dedicated, manual scale
  - Standard — auto-scale, deployment slots (5), custom domains/SSL
  - Premium — more scale, VNet integration, more slots
  - Isolated (ASE) — fully private, customer VNet injection

| Feature | When Available |
|---|---|
| **Deployment slots** | Standard and above |
| **Auto-scale** | Standard and above |
| **VNet Integration** | Premium and above (outbound); exact tier availability varies — verify current docs ⚠️ |
| **Private Endpoint** | Premium and above (inbound); exact tier availability varies — verify current docs ⚠️ |

- **Slot swap** — zero-downtime deployment; swap staging → production
- **Slot settings** — "sticky" app settings that don't swap
- **Deployment methods:** ZIP deploy, Git, GitHub Actions, Azure DevOps, FTP, Run from Package

### Azure Container Instances (ACI)

- Fastest way to run containers in Azure; no cluster management
- **Container Groups** — multiple containers sharing network/storage on same host; **multi-container groups are Linux only** (Windows container groups support only a single container)
- Good for: burst workloads, isolated tasks, simple microservices
- Not suitable for: auto-scaling, load balancing, orchestration (use AKS instead)

### Azure Container Apps

- Serverless container platform built on Kubernetes (KEDA + Dapr under the hood); no cluster management
- **Container types within a container app:**
  - **Init containers** — run once and complete **before** the main container starts (setup tasks)
  - **Sidecar containers** — run **alongside** the main container in the same app; share network/storage (e.g., cache refresh, log forwarding, proxy)
- **Revisions** — immutable snapshots; used for blue/green or A/B deployments
- **Scaling:** event-driven via KEDA (HTTP, queue depth, CPU, custom metrics); scales to zero
- **Environments** — shared boundary for container apps (shared VNet, Log Analytics)

✅ **Exam Tip:** Use a **sidecar** container when you need a helper that runs continuously alongside the main container (e.g., auto-refreshing a cache). Use **init** when you need one-time setup before the app starts.

### Azure Kubernetes Service (AKS)

- Managed Kubernetes; Azure manages control plane (free); you pay for agent nodes
- **Node pools** — groups of VMs with same config; system pool required + optional user pools
- **Cluster autoscaler** — scales node count; **Horizontal Pod Autoscaler (HPA)** — scales pod count
- **Ingress controller** — HTTP routing into cluster (commonly nginx or Azure Application Gateway Ingress Controller)
- **Azure CNI** — pods get VNet IPs; **Kubenet** — pods get non-routable IPs (NAT)
- **Managed identity** — preferred auth for AKS to access other Azure resources

### Azure Functions

- Serverless compute; event-driven; pay-per-execution
- **Hosting plans:**
  - **Consumption** — auto-scale, cold start, 5-min timeout (max 10 min)
  - **Premium** — pre-warmed instances, no cold start, longer timeout
  - **Dedicated (App Service Plan)** — always-on, predictable cost
- **Durable Functions** — stateful workflows; uses `orchestrator`, `activity`, and `entity` functions
- **Triggers:** HTTP, Timer, Blob, Queue, Service Bus, Event Hub, Event Grid, Cosmos DB

---

## 4. Implement and Manage Virtual Networking (15–20%)

### Virtual Networks (VNets)

- Logical isolation within a region; tied to a subscription
- **Address space** — CIDR block(s); must not overlap when peering
- **Subnets** — divide VNet; each subnet gets a range from the VNet address space
- **Reserved IPs per subnet:** first 4 + last 1 (e.g., `/24` → 251 usable)
- VNets **cannot span regions** — use Global VNet Peering instead

### Network Security Groups (NSGs)

- Stateful firewall at NIC or subnet level (subnet recommended)
- Rules: Priority (100–4096, lower = higher priority) + Action (Allow/Deny) + Source/Dest + Port + Protocol
- **Default rules** (cannot delete, can override with lower priority number):
  - Allow VNet inbound/outbound
  - Allow Azure Load Balancer inbound
  - Deny all inbound from internet (DenyAllInBound — priority 65500)
  - Allow all outbound to internet (AllowInternetOutBound — priority 65001)

✅ **Exam Tip:** Traffic denied by default if no rule matches and no explicit allow exists.

### Azure Firewall

- Managed, stateful L3–L7 network firewall; deployed in a VNet (or Virtual WAN hub)
- **Rule types:** DNAT, Network (IP/port/protocol), Application (FQDN-based)
- **FQDN tags** — predefined groups (e.g., `WindowsUpdate`, `AzureKubernetesService`)
- **Forced tunneling** — route internet-bound traffic through on-premises firewall
- **Azure Firewall Premium** — adds IDPS, TLS inspection, URL filtering, web categories

### VNet Peering

| Type | Description |
|---|---|
| **Local Peering** | Same region; low latency, Microsoft backbone |
| **Global Peering** | Different regions; pricing may differ from local peering — verify current Azure networking rates ⚠️ |

- Non-transitive by default — A↔B, B↔C does **not** mean A↔C
- To enable transitivity: use Azure Firewall / NVA as hub, or Azure Virtual WAN
- **Allow Gateway Transit / Use Remote Gateways** — share a VPN/ExpressRoute gateway across peered VNets

### VPN Gateway

| SKU | Max Throughput | Use Case |
|---|---|---|
| Basic | 100 Mbps | Dev/test only |
| VpnGw1/2/3 | 650 Mbps–10 Gbps | Production S2S/P2S |
| VpnGw1AZ/2AZ/3AZ | Same + zone redundant | High availability |

- **Site-to-Site (S2S)** — on-premises to Azure over IPsec/IKE
- **Point-to-Site (P2S)** — individual client to Azure; supports SSTP, OpenVPN, IKEv2
- **VNet-to-VNet** — two Azure VNets via VPN Gateway (alternative: VNet peering, which is faster/cheaper)

✅ **Exam Tip:** When you add VNet peering after a P2S VPN is already configured, you must **download and reinstall** the P2S VPN client on all devices. The client profile contains routing info that becomes stale when peering changes.
- **Active-active mode** — two public IPs, higher availability
- Requires a **GatewaySubnet** subnet (no other resources in it)

### ExpressRoute

- Private dedicated circuit from on-premises to Azure (via connectivity provider)
- **Not encrypted by default** (private circuit, not internet); add MACsec or IPsec for encryption
- **Peering types:**
  - **Private Peering** — access Azure VNets
  - **Microsoft Peering** — access Microsoft 365, Azure public services
- **ExpressRoute Global Reach** — connect two on-premises sites via Microsoft backbone
- **ExpressRoute FastPath** — bypass VNet Gateway data path for highest throughput

### Load Balancers

| Service | Layer | Scope | Use Case |
|---|---|---|---|
| **Azure Load Balancer** | L4 (TCP/UDP) | Regional | Internal or external VM load balancing |
| **Application Gateway** | L7 (HTTP/HTTPS) | Regional | Web apps; URL routing, WAF, SSL offload |
| **Traffic Manager** | DNS | Global | Geographic/latency-based routing between regions |
| **Azure Front Door** | L7 + CDN | Global | Global web acceleration, WAF, failover |

**Azure Load Balancer SKUs:**

| SKU | Zone-redundant | Backend Pool | Health Probe |
|---|---|---|---|
| **Basic** | No | Same Availability Set or VMSS | TCP/HTTP |
| **Standard** | Yes | Any VM in VNet | TCP/HTTP/HTTPS |

**Azure Load Balancer Distribution Modes:**

| Mode | Description | Use Case |
|---|---|---|
| **5-tuple hash** (default) | Hash of src IP, src port, dst IP, dst port, protocol | Even distribution; new connections may go to different VMs |
| **Source IP affinity (2-tuple)** | Hash of src + dst IP | Session stickiness by client IP |
| **Source IP affinity (3-tuple)** | Hash of src IP, dst IP, protocol | Session stickiness including protocol |

✅ **Exam Tip:** Session persistence (source IP affinity) keeps a client on the same backend — but can cause uneven load. Use 5-tuple hash for even distribution.

✅ **Exam Tip:** Standard LB required for zone-redundant architecture. Basic LB is being retired.

**Application Gateway components:**

- **Frontend IP** — public or private
- **Listener** — port + protocol (HTTP/HTTPS)
- **Backend pool** — VMs, VMSS, App Service, IP addresses
- **HTTP settings** — protocol, port, affinity, path-based rules
- **WAF** — OWASP rule sets; Detection vs. Prevention mode

### DNS

- **Azure DNS** — host public DNS zones; authoritative DNS (no domain registration)
- **Private DNS Zones** — name resolution within VNets; auto-registration of VM names
- **Azure-provided DNS** — `168.63.129.16`; resolves Azure resources by default
- Custom DNS servers set at VNet level override Azure-provided DNS

### Private Endpoints & Service Endpoints

| Feature | Private Endpoint | Service Endpoint |
|---|---|---|
| Traffic path | Private IP in your VNet | Azure backbone (still uses service public IP) |
| Data exfiltration protection | Yes (NIC in VNet) | Partial |
| DNS change required | Yes | No |
| Cross-region support | Yes | No |

### Routing and Egress

#### User-Defined Routes (UDR) / Route Tables

- **Route table** — attach to a subnet to override Azure's default system routes
- **Default system routes** include: local VNet, peered VNets, internet (0.0.0.0/0), and service endpoint routes
- **UDR use cases:** force internet-bound traffic through an NVA/firewall; override peering routes; isolate subnets
- **Next hop types:** `VirtualAppliance` (NVA IP), `VirtualNetworkGateway`, `VnetLocal`, `Internet`, `None` (drop)
- Attach a route table to a GatewaySubnet only when forced tunneling is needed; otherwise avoid it

✅ **Exam Tip:** To route all internet traffic from a subnet through Azure Firewall, add a UDR `0.0.0.0/0 → VirtualAppliance → <Firewall private IP>` to that subnet's route table.

#### NAT Gateway

- Provides **outbound-only** SNAT for resources in a subnet; no inbound initiated from internet
- Replaces per-VM public IPs or LB outbound rules for predictable egress
- Assigns a static set of public IP addresses/prefixes — all outbound flows share those IPs
- Attach to one or more subnets; **not compatible with Basic SKU** public IPs or Basic LB
- **SNAT port exhaustion** — NAT Gateway scales SNAT ports automatically (up to 64K per public IP)

✅ **Exam Tip:** If a question asks for a scalable, predictable outbound IP without exposing inbound ports → NAT Gateway.

#### Application Security Groups (ASGs)

- Logical grouping of VM NICs; used **inside NSG rules** instead of explicit IP ranges
- Allows rules like: "Allow AppServers → DbServers on port 1433" without knowing IPs
- VM NIC must be in the **same VNet** as the ASG
- One NIC can belong to multiple ASGs; ASG membership is applied at the NIC level
- Simplify NSG rule management as VMs scale — no IP updates needed

✅ **Exam Tip:** ASGs reduce rule sprawl in large deployments; the exam often tests whether you know ASGs work within a single VNet scope.

#### Private DNS Resolution Patterns

| Scenario | Solution |
|---|---|
| VMs resolving each other by name within a VNet | Private DNS Zone linked with auto-registration enabled |
| On-premises resolving Azure Private DNS zones | DNS forwarder VM (or Azure DNS Private Resolver) in the VNet forwarding to `168.63.129.16` |
| Azure VMs resolving on-premises DNS names | Custom DNS server at VNet level pointing to on-prem DNS |
| Split-horizon (same name resolves differently inside vs. outside VNet) | Private DNS zone with same name as public zone, linked to VNet |

- **Azure DNS Private Resolver** — managed inbound/outbound endpoints; replaces custom DNS forwarder VMs
- Auto-registration only registers VM NICs — it does not register App Services, AKS nodes, or other non-VM resources

---

## 5. Monitor and Maintain Azure Resources (10–15%)

### Azure Monitor

- Central monitoring platform for all Azure resources
- **Data types collected:**
  - **Metrics** — numeric time-series (CPU%, free memory); stored 93 days by default
  - **Logs** — structured/unstructured records in Log Analytics workspace
  - **Activity Log** — subscription-level control-plane events (who did what, when); retained 90 days
  - **Resource Logs (Diagnostic Logs)** — data-plane events per resource; must be explicitly enabled

### Log Analytics

- Workspace-based log store; query with **KQL (Kusto Query Language)**
- **Diagnostic settings** — send resource logs + metrics to Log Analytics, Storage Account, or Event Hub
- **Data retention:** 30 days default (free), configurable up to 730 days (charge for >30 days)

**Key KQL patterns:**

```kql
// Filter and count errors in last hour
AzureDiagnostics
| where TimeGenerated > ago(1h)
| where Level == "Error"
| summarize count() by Resource

// VM CPU average over 5-min intervals
Perf
| where ObjectName == "Processor" and CounterName == "% Processor Time"
| summarize avg(CounterValue) by bin(TimeGenerated, 5m), Computer
```

### Alerts

- **Alert Rule** = Condition + Action Group + Severity (0–4)
- **Signal types:** Metric, Log (KQL query), Activity Log, Resource Health
- **Action Group** — list of notification/action targets:
  - Email/SMS/Voice/Push
  - Azure Function, Logic App, Webhook, Runbook, ITSM
- **Alert processing rules** — suppress or route alerts (e.g., silence during maintenance)
- **Smart groups** — ML-based grouping of related alerts

**Alert States:**

| State | How It Occurs |
|---|---|
| **New** | Alert fired, not yet reviewed |
| **Acknowledged** | Under investigation by an admin |
| **Closed** | **Manually set** by an admin — NOT automatic |
| **Resolved** | Alert condition cleared automatically by the system |

✅ **Exam Tip:** "Closed" is a **manual** state change by an administrator. The system sets "Resolved" when conditions clear. They are different — a Closed alert was deliberately dismissed.

### Azure Advisor

- Free personalized recommendations across 5 categories:
  1. **Cost** — right-size or deallocate underused resources
  2. **Security** — Defender for Cloud integration
  3. **Reliability (HA)** — single-VM alerts, availability set recommendations
  4. **Operational Excellence** — service health, subscription limits
  5. **Performance** — slow queries, under-provisioned resources

### Azure Service Health

| Component | What It Shows |
|---|---|
| **Azure Status** | Broad outage page (status.azure.com) |
| **Service Health** | Outages, planned maintenance affecting **your** subscriptions/regions |
| **Resource Health** | Health of **specific resources** (is my VM running?) |

- Create **Service Health Alerts** to get notified of incidents affecting your regions/services

### Backup & Recovery

#### Azure Backup

- **Recovery Services Vault** — stores backup data; tied to a region
- **Backup types:**
  - Azure VM backup (full + incremental)
  - Azure Files shares
  - SQL Server in Azure VM
  - On-premises via MARS agent or Azure Backup Server (MABS)
- **Backup policies** — define schedule (daily/weekly) and retention (days/weeks/months/years)
- **Soft delete** — 14-day retention after deletion (enabled by default for VMs)
- **Cross-region restore** — restore to paired region using GRS vault

#### Azure Site Recovery (ASR)

- Disaster recovery (DR) — replicate VMs to secondary region for failover
- **RPO:** ~30 seconds (Azure-to-Azure replication)
- **Replication policy** — crash-consistent recovery points every 5 min, app-consistent every 1–4 hours
- **Test failover** — validate DR without impacting production
- **Failover** → **Commit** → **Re-protect** (reverse replication) → **Failback**

### Azure Update Manager

- Replaces Azure Automation Update Management for VM patching
- Assess, schedule, and apply OS updates for Windows and Linux VMs
- **Maintenance configurations** — schedule patch windows; associate to VMs or subscriptions

---

## 6. Quick-Reference Tables

### "Which tool do I use?" Decision Table

| Scenario | Answer |
|---|---|
| Block all inbound traffic to a VM NIC | NSG (Deny rule, low priority number) |
| Filter traffic by FQDN | Azure Firewall (Application rule) |
| Balance TCP traffic across VMs in same region | Azure Load Balancer (Standard) |
| Route HTTP traffic based on URL path | Application Gateway |
| Geo-route users to nearest region | Traffic Manager (Performance routing) |
| Global HTTP routing + WAF + CDN | Azure Front Door |
| Connect on-premises to Azure over private circuit | ExpressRoute |
| Connect on-premises to Azure over internet | VPN Gateway (S2S) |
| Assign role only for duration of need | PIM (Privileged Identity Management) |
| Enforce a tag on all resource groups | Azure Policy (Modify or Deny effect) |
| Auto-delete old storage blobs | Blob lifecycle management policy |
| Replicate VMs to another region for DR | Azure Site Recovery |
| Back up Azure Files share | Azure Backup (Recovery Services Vault) |
| Move 60 TB of data offline to Azure | Azure Data Box |
| Monitor and alert on CPU > 80% | Azure Monitor Metric Alert + Action Group |

### RBAC vs. Azure Policy

| | RBAC | Azure Policy |
|---|---|---|
| **Controls** | Who can do actions | What configurations are allowed |
| **Scope** | MG / Sub / RG / Resource | MG / Sub / RG / Resource |
| **Inheritance** | Yes (downward) | Yes (downward) |
| **Can block resource creation** | No (only denies unauthorized users) | Yes (Deny effect) |
| **Remediation** | N/A | Yes (DeployIfNotExists, Modify) |

### SAS Types Comparison

| SAS Type | Auth Basis | Revocation Method |
|---|---|---|
| Account SAS | Storage account key | Rotate key |
| Service SAS | Storage account key | Rotate key (or use Stored Access Policy) |
| User Delegation SAS | Entra ID | Revoke credential or wait for expiry |

### VM SLA Summary

| Configuration | SLA |
|---|---|
| Single VM + Premium SSD | 99.9% |
| Availability Set (2+ VMs) | 99.95% |
| Availability Zones (2+ VMs) | 99.99% |
| VMSS + Availability Zones | 99.99% |

---

## 7. Common Exam Traps

1. **LRS vs. ZRS vs. GRS** — LRS protects against **hardware failure within a datacenter**, not zone/region failure. Use ZRS for zone resilience, GRS for region DR.

2. **RA-GRS read access** — you can read from secondary region **without failover**, but secondary is updated asynchronously (may lag behind primary).

3. **Archive tier requires rehydration** — you cannot read an archived blob directly; must rehydrate to Hot/Cool first (up to 15 hours standard).

4. **NSG stateful rule direction** — NSGs are stateful; if inbound is allowed, return traffic is automatically allowed (you don't need an outbound rule).

5. **Azure Firewall vs. NSG** — NSG = L4 filtering (IP/port); Azure Firewall = L3–L7, FQDN filtering, centralized management. Both can coexist.

6. **Contributor vs. Owner** — Contributor **cannot** assign roles; only Owner and User Access Administrator can manage role assignments.

7. **Policy Deny vs. RBAC Deny** — Azure Policy `Deny` blocks resource creation based on configuration; RBAC restricts what **users** can do. They are complementary, not equivalent.

8. **App Service Deployment Slots** — only available at **Standard tier and above**. Slot swap is **not** the same as a swap of app settings marked as slot-specific ("sticky settings").

9. **VNet Peering is non-transitive** — peering A↔B and B↔C does NOT route A→C. Use a hub VNet with Azure Firewall or Virtual WAN for transitive routing.

10. **ExpressRoute is not encrypted** — it's a private circuit, but IPsec/MACsec must be configured separately for encryption.

11. **Basic vs. Standard Load Balancer** — Standard LB is required for Availability Zones. Basic LB does not support zone-redundancy and is deprecated.

12. **Temp disk data loss** — VM temp disk (`D:` on Windows, `/dev/sdb1` on Linux) is **ephemeral** — data is lost when VM is deallocated or resized.

13. **Availability Set FD/UD** — Fault Domain = same physical rack (power/network); Update Domain = patched together. Max 3 FDs, max 20 UDs.

14. **Private DNS Zone auto-registration** — only works for VMs in **linked** VNets with auto-registration enabled. DNS resolution requires the zone to be linked.

15. **ACI vs. AKS** — ACI is for simple, short-lived tasks; AKS is for orchestrated, auto-scaled containerized workloads.

16. **Cold vs. Cool storage tier** — Both are for infrequent access. Cool = 30-day minimum retention; Cold = 90-day minimum retention. When a question requires **fast retrieval (seconds)** + 90-day minimum + lowest cost → **Cold**, not Cool.

17. **Immutability policy vs. Lifecycle management** — Lifecycle management auto-tiers or deletes blobs after a time period. Immutability (WORM) **prevents modification or deletion** for a locked retention period — use this for compliance.

18. **Azure Monitor "Closed" vs. "Resolved" alert states** — "Closed" is **manually** set by an admin; "Resolved" means the alert condition cleared automatically. The system does NOT automatically close alerts. Note: these are **Azure Monitor** alert states — Azure Advisor has separate recommendation states and is a distinct service.

19. **Cost Management Contributor vs. Billing Reader** — Billing Reader is read-only billing info. Cost Management Contributor can **view costs AND manage budgets/exports** — correct for scenarios needing budget management without modifying resources.

20. **SSPR for guests** — Guest users (Type: Guest) **cannot** use SSPR. Only member users can. On-prem synced members need password writeback enabled.

---

## Reference Links

- [AZ-104 Study Guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104)
- [Azure RBAC built-in roles](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles)
- [Azure Policy effects](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effect-basics)
- [Storage redundancy options](https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy)
- [Azure Monitor overview](https://learn.microsoft.com/en-us/azure/azure-monitor/overview)
- [VPN Gateway SKUs](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpngateways)
- [App Service plan overview](https://learn.microsoft.com/en-us/azure/app-service/overview-hosting-plans)
