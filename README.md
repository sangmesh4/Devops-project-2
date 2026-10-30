# 🏡 Lavish Real Estate   
### 🚀 Automated AWS DevOps CI/CD Pipeline on Kubernetes  
### 🌐 From `git push` to a Live Website on Amazon EKS  
### ⚡ Fully Automated using Jenkins, Docker & Kubernetes  

![AWS EKS](https://img.shields.io/badge/AWS-EKS-orange)
![Jenkins CI/CD](https://img.shields.io/badge/Jenkins-CI/CD-red)
![Docker Containerization](https://img.shields.io/badge/Docker-Containerization-blue)
![Kubernetes Orchestration](https://img.shields.io/badge/Kubernetes-Orchestration-326CE5)
![Apache Web Server](https://img.shields.io/badge/Apache-Web_Server-red)
![Ubuntu 24.04](https://img.shields.io/badge/Ubuntu-24.04-E95420)

---

## 📑 Table of Contents

1. [Project Overview](#1️⃣-📖-project-overview)
2. [Architecture Diagram](#2️⃣-🏗️-architecture-diagram)
3. [Technology Stack](#3️⃣-🛠️-technology-stack)
4. [CI/CD Workflow](#4️⃣-🔄-complete-cicd-workflow)
5. [AWS Infrastructure](#5️⃣-☁️-aws-infrastructure)
6. [Kubernetes Deployment](#6️⃣-☸️-kubernetes-deployment)
7. [Security Implementation](#7️⃣-🔐-security-implementation)
8. [Jenkins Pipeline Flow](#8️⃣-⚙️-jenkins-pipeline-stages)
9. [Application Deployment Process](#9️⃣-🌍-deployment-flow)
10. [Project Features](#🔟-⭐-key-features)
11. [Interview Pitch](#1️⃣1️⃣-🎤-30-second-interview-pitch)
12. [Key Learnings](#1️⃣2️⃣-🎓-key-learnings)
13. [Cost Optimization](#1️⃣3️⃣-💰-cost-optimization)
14. [Future Enhancements](#1️⃣4️⃣-🚀-future-enhancements)

---

## 1️⃣ 📖 Project Overview

The **Lavish Real Estate** project demonstrates a complete DevOps CI/CD implementation on AWS Cloud.

A developer develops and updates the website on an **Ubuntu 24.04 EC2 Development Server**, then pushes changes to GitHub. A configured **GitHub Webhook** immediately notifies Jenkins, triggering an automated deployment pipeline.

The pipeline performs the following tasks automatically:

- ✅ Pull latest source code from GitHub  
- ✅ Build a Docker image  
- ✅ Tag the image with Build Number and Latest Version  
- ✅ Push image to Docker Hub  
- ✅ Authenticate with AWS EKS  
- ✅ Deploy updated application to Kubernetes  
- ✅ Perform rolling updates with zero downtime  

The application runs on an **Amazon EKS Cluster** with multiple replicas to ensure:

- High Availability  
- Self-Healing  
- Automatic Rollbacks  
- Scalability  
- Load Balancing  

---

## 2️⃣ 🏗️ Architecture Diagram

```text
┌───────────────┐
│   Developer   │
└───────┬───────┘
        │ Git Push
        ▼
┌───────────────┐
│    GitHub     │
└───────┬───────┘
        │ Webhook Trigger
        ▼
┌───────────────┐
│    Jenkins    │
│ CI/CD Server  │
└───────┬───────┘
        │
 ┌──────┼──────┐
 │      │      │
 ▼      ▼      ▼
Clone  Build  Test
Code   Image
        │
        ▼
┌───────────────┐
│  Docker Hub   │
└───────┬───────┘
        │ Pull Image
        ▼
┌───────────────┐
│  Amazon EKS   │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│  LoadBalancer │
└───────┬───────┘
        │
        ▼
🌐 Live Website
```

---

## 3️⃣ 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Version Control | Git, GitHub |
| CI/CD | Jenkins |
| Containerization | Docker |
| Image Registry | Docker Hub |
| Container Orchestration | Kubernetes |
| Cloud Provider | AWS |
| Compute | EC2 |
| Kubernetes Platform | Amazon EKS |
| Identity & Access | IAM |
| Operating System | Ubuntu 24.04 |
| Web Server | Apache2 |

---

## 4️⃣ 🔄 Complete CI/CD Workflow

| Step | Description |
|---|---|
| Step 1 | 👨‍💻 Developer updates source code |
| Step 2 | 🐙 Code is pushed to GitHub Repository |
| Step 3 | 🔔 GitHub Webhook triggers Jenkins automatically |
| Step 4 | 🏗️ Jenkins Pipeline starts |
| Step 5 | 📥 Source code is cloned |
| Step 6 | 🐳 Docker image is built |
| Step 7 | 🏷️ Image is tagged |
| Step 8 | 📤 Image is pushed to Docker Hub |
| Step 9 | ☁️ Jenkins authenticates with AWS |
| Step 10 | ☸️ Kubernetes deployment gets updated |
| Step 11 | 🌐 Application becomes available through AWS Load Balancer |

### Docker Image Tags

```bash
lavish-realestate:${BUILD_NUMBER}
lavish-realestate:latest
```

---

## 5️⃣ ☁️ AWS Infrastructure

### 🔹 EC2 Instances

| Server | Purpose |
|---|---|
| Dev Server | Application Development |
| Jenkins Server | CI/CD Automation |

### 🔹 Amazon EKS

**Cluster Name:** `cluster1`

**Managed Node Group:**

- Worker Node 1  
- Worker Node 2  

**Benefits:**

- ✅ High Availability  
- ✅ Managed Kubernetes Control Plane  
- ✅ Easy Scaling  
- ✅ Automated Health Monitoring  

### 🔹 IAM Configuration

An IAM User was created specifically for Jenkins deployment operations.

**Assigned Permissions:**

- `AmazonEKSClusterAdminPolicy`

This enables Jenkins to:

- Access EKS Cluster  
- Update Deployments  
- Manage Kubernetes Resources  

---

## 6️⃣ ☸️ Kubernetes Deployment

### Deployment Configuration

- **Replicas:** 2  
- **Strategy:** RollingUpdate  

### Benefits

- ✅ High Availability  
- ✅ Self-Healing  
- ✅ Horizontal Scalability  
- ✅ Zero Downtime Deployment  
- ✅ Easy Rollback  

### Service Type

- **Type:** LoadBalancer  

### Benefits

- ✅ Public Access  
- ✅ Automatic AWS Load Balancer Creation  
- ✅ Traffic Distribution Across Pods  

---

## 7️⃣ 🔐 Security Implementation

Security best practices followed:

### Secrets Management

- ✅ Docker Hub Credentials stored in Jenkins Credentials  
- ✅ AWS Access Keys stored securely in Jenkins  
- ✅ No secrets hardcoded in source code  

### IAM Security

- ✅ Principle of Least Privilege  
- ✅ Dedicated Deployment User  
- ✅ Controlled EKS Access  

### Linux Security

```bash
chmod 600 ~/.kube/config
```

Ensures only the owner can read/write Kubernetes configuration files.

---

## 8️⃣ ⚙️ Jenkins Pipeline Stages

```text
Stage 1  → Checkout Code
Stage 2  → Build Docker Image
Stage 3  → Tag Docker Image
Stage 4  → Push to Docker Hub
Stage 5  → Configure AWS Access
Stage 6  → Update Kubeconfig
Stage 7  → Deploy to EKS
Stage 8  → Verify Deployment
```

---

## 9️⃣ 🌍 Deployment Flow

```text
Developer
   │
   ▼
GitHub
   │
   ▼
Webhook
   │
   ▼
Jenkins
   │
   ▼
Docker Build
   │
   ▼
Docker Hub
   │
   ▼
Amazon EKS
   │
   ▼
LoadBalancer
   │
   ▼
Live Website
```

---

## 🔟 ⭐ Key Features

- ✅ Fully Automated CI/CD  
- ✅ Infrastructure on AWS  
- ✅ Amazon EKS Deployment  
- ✅ Dockerized Application  
- ✅ GitHub Webhook Integration  
- ✅ Zero-Touch Deployment  
- ✅ Rolling Updates  
- ✅ Self-Healing Pods  
- ✅ Load Balancing  
- ✅ Secure Credential Management  
- ✅ Production-Oriented Architecture  

---

## 1️⃣1️⃣ 🎤 👉30-Second Quickly memorize 🧠

> “I built an end-to-end DevOps CI/CD pipeline for a Real Estate web application on AWS. Whenever code is pushed to GitHub, a webhook automatically triggers Jenkins. Jenkins builds a Docker image, pushes it to Docker Hub, and deploys the updated application to Amazon EKS. The application runs with two Kubernetes replicas behind a LoadBalancer, providing high availability, self-healing, rolling updates, and zero downtime deployments. I secured the environment using IAM roles and Jenkins Credentials while following DevOps and cloud security best practices.”

---

## 1️⃣2️⃣ 🎓 Key Learnings

### CI/CD

- 🔁 Pipeline Automation  
- 🔁 Continuous Deployment  
- 🔁 Webhooks  

### Docker

- 🐳 Dockerfile Creation  
- 🐳 Image Build & Tagging  
- 🐳 Docker Hub Integration  

### Kubernetes

- ☸️ Pods  
- ☸️ Deployments  
- ☸️ Services  
- ☸️ Labels & Selectors  
- ☸️ Rollbacks  
- ☸️ Scaling  

### AWS

- ☁️ EC2  
- ☁️ EKS  
- ☁️ IAM  
- ☁️ Security Groups  
- ☁️ Worker Nodes  
- ☁️ Cluster Administration  

### Security

- 🔐 Least Privilege Access  
- 🔐 Secrets Management  
- 🔐 File Permissions  
- 🔐 Secure Deployments  

---

## 1️⃣3️⃣ 💰 Cost Optimization

To prevent unnecessary AWS charges:

- ✅ Deleted EKS Cluster  
- ✅ Removed Node Groups  
- ✅ Deleted EC2 Instances  
- ✅ Removed Load Balancers  
- ✅ Released Elastic IPs  
- ✅ Cleaned Up IAM Test Resources  

---

## 1️⃣4️⃣ 🚀 Future Enhancements

- 🔹 Integrate SonarQube for Code Quality Analysis  
- 🔹 Add Trivy for Container Vulnerability Scanning  
- 🔹 Configure Prometheus Monitoring  
- 🔹 Configure Grafana Dashboards  
- 🔹 Implement ArgoCD (GitOps)  
- 🔹 Add Horizontal Pod Autoscaler  
- 🔹 Setup Route53 Custom Domain  
- 🔹 Enable HTTPS using AWS ACM  

---

## 🌟 Final Outcome 🤗

A fully automated **Production-Style DevOps CI/CD Pipeline** where every Git push triggers an end-to-end deployment workflow:

```text
GitHub → Jenkins → Docker Hub → Amazon EKS
```

Resulting in a live Kubernetes-hosted application with minimal manual intervention, secure access controls, and cloud-native deployment practices. 🚀☁️☸️

---

⭐ If you found this project helpful, don't forget to star the repository! ⭐
