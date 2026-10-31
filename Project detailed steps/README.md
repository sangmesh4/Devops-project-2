<div align="center">

# 🏡 Lavish Real Estate Website 💻
### ☁️ End-to-End AWS DevOps CI/CD Project ♾️

**GitHub → Jenkins → Docker → DockerHub → Amazon EKS (Kubernetes)**

![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white)
![Ubuntu](https://img.shields.io/badge/Ubuntu_24.04-E95420?style=for-the-badge&logo=ubuntu&logoColor=white)

</div>

---

## 📑 Table of Contents

| # | Section |
|---|---------|
| 1 | [📌 Project Overview](#1--project-overview) |
| 2 | [🖥️ Dev Server Setup](#2-️-dev-server-setup) |
| 3 | [⚙️ Jenkins Server Setup](#3-️-jenkins-server-setup) |
| 4 | [🔗 GitHub Webhook](#4--github-webhook) |
| 5 | [☁️ AWS Setup (EKS + IAM)](#5-️-aws-setup-eks--iam) |
| 6 | [🧰 AWS CLI on Jenkins Server](#6--aws-cli-on-jenkins-server) |
| 7 | [🛠️ eksctl & kubectl Installation](#7-️-eksctl--kubectl-installation) |
| 8 | [🔐 EKS Access Configuration](#8--eks-access-configuration) |
| 9 | [📦 Kubernetes Manifests](#9--kubernetes-manifests) |
| 10 | [🐳 Docker Hub & Jenkins Credentials](#10--docker-hub--jenkins-credentials) |
| 11 | [🚀 Jenkins Pipeline](#11--jenkins-pipeline) |
| 12 | [✅ Run, Verify & Update Workflow](#12--run-verify--update-workflow) |
| 13 | [🐚 Working Inside a Pod](#13--working-inside-a-pod) |
| 14 | [🧹 Cleanup](#14--cleanup-avoid-unnecessary-aws-bills) |
| 15 | [📝 Notes & Fixes](#15--notes--fixes) |

---

## 1. 📌 Project Overview

**🧩 DevOps tools covered:** Git & GitHub, Docker, Jenkins, Kubernetes.

**☁️ AWS tools covered:** EC2 instances, EKS (cluster with worker nodes), IAM (user & access policies).

**🐧 Servers (Ubuntu 24.04 LTS EC2):**

| Server | Purpose | Suggested Type |
|--------|---------|----------------|
| 🧑‍💻 Dev Server | Push website code to GitHub | `t2.micro` / `t3.micro` |
| 🏗️ Jenkins Master | CI/CD automation | `t2.medium` / `t3.medium` |
| ☸️ K8s Worker Node | Created automatically by the EKS node group | per node group config |

**🔄 Overall Flow**

```
👨‍💻 Developer ──push──► GitHub ──webhook──► Jenkins ──build──► Docker Image
                                                              │
                                                              ▼
                                      Amazon EKS ◄──deploy── DockerHub
                                          │
                                          ▼
                                   Load Balancer DNS 🌐
```

---

## 2. 🖥️ Dev Server Setup

> 🎯 **Purpose:** Push the website code to GitHub.

**Server config:** `t2.micro / t3.micro` — AMI: *Ubuntu Server 24.04 LTS (HVM), SSD Volume Type*

### 2.1 📥 Get the website files onto the server

Choose either option:

1. Files present on your local machine → move them to the server with **WinSCP**, then push to GitHub **OR**
2. Download a zip template and push the files to GitHub:

```bash
wget https://www.tooplate.com/zip-templates/2130_waso_strategy.zip
```

> 💡 In this project the files were on the local system, moved to the server with WinSCP, and then pushed to GitHub.

### 2.2 📂 Unzip the website files

```bash
cd /root
apt-get update -y
apt install unzip -y
unzip <your_website_zip_file>.zip      # e.g. unzip 2120_max_fashion.zip
cd /root/<website_folder>              # e.g. cd /root/max_fashion
```

### 2.3 🐋 Create the Dockerfile

A **Dockerfile** is a text file containing step-by-step instructions for building a Docker image. It tells Docker which base system to use, what files and dependencies to include, and how to start your application inside a container.

```bash
vim Dockerfile
```

```dockerfile
FROM ubuntu
RUN apt-get update -y
RUN apt-get install -y apache2
COPY . /var/www/html
CMD ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]
```

| Instruction | 📖 Explanation |
|-------------|----------------|
| `FROM ubuntu` | Uses the official Ubuntu image as the base OS. Your container starts from this image. |
| `RUN apt-get update -y` | During image build, refreshes the APT package index so Ubuntu can find the latest available packages. |
| `RUN apt-get install -y apache2` | During image build, installs the Apache web server. `-y` automatically answers "yes" to prompts. |
| `COPY . /var/www/html` | Copies everything from the Docker build context (your project folder) into Apache's default web root. e.g. `index.html` → `/var/www/html/index.html`. |
| `CMD ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]` | Default command when the container starts: launch Apache in the foreground. |

### 2.4 🔼 Push the code to GitHub

```bash
apt install git -y        # optional (git is already installed on Ubuntu)
git init
git add *
git commit -m "Initial commit lavish Website"
```

1. Create a repository on GitHub → **`Devops-project-2`**
2. Link and push:

```bash
git remote add origin https://github.com/sangmesh4/Devops-project-2.git
git push -u origin master
```

> ⚠️ The repository name should match the name mentioned in the pipeline.

> 📁 **Tip:** Also place the `k8s/` folder (with `deployment.yml` and `service.yml`) in this repo, since the pipeline applies `k8s/` from the checked-out code (see [Section 9](#9--kubernetes-manifests)).

---

## 3. ⚙️ Jenkins Server Setup

A **Jenkins server** is an open-source automation server used to automatically build, test, and deploy software. It is mainly used for **CI/CD** — Continuous Integration and Continuous Delivery/Deployment — so teams can release reliable updates faster with less manual work.

**Server config:** `jenkins-master (t2.medium / t3.medium)` — AMI: *Ubuntu Server 24.04 LTS (HVM), SSD Volume Type*

### 3.1 📦 Install Jenkins

```bash
apt update -y
apt install fontconfig openjdk-21-jre -y

wget -O /etc/apt/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key

echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

apt update -y
apt install jenkins -y
systemctl start jenkins
```

### 3.2 👤 Add the `jenkins` user to sudoers

```bash
vim /etc/sudoers
```

```
jenkins ALL=(ALL) NOPASSWD: ALL
```

> 📝 **Why?** Jenkins runs its jobs as the local OS user `jenkins`, which is a non-root user by default. A sudoers entry is needed only when your pipeline must run privileged OS commands — such as installing packages, managing Docker/systemd services, changing ownership, mounting storage, or restarting services — without an interactive password prompt.

### 3.3 🐳 Install Docker & Git

```bash
apt install git -y               # optional (already present on Ubuntu server)
apt install docker.io -y         # Install Docker
systemctl start docker           # starts Docker right now
systemctl enable docker          # starts Docker automatically on every reboot
usermod -aG docker jenkins       # lets the jenkins user run Docker commands
systemctl restart jenkins        # restart Jenkins
systemctl restart docker         # restart Docker
```

### 3.4 🌐 Access the Jenkins GUI

1. Open **port 8080** in the Jenkins server's EC2 **Security Group (Inbound Rules)**.
2. Open in a browser:

```
http://<jenkins_server_public_ip>:8080
```

3. 🔓 **Unlock Jenkins** — run this on the Jenkins server to get the first-time password:

```bash
cat /var/lib/jenkins/secrets/initialAdminPassword
```

---

## 4. 🔗 GitHub Webhook

Go to **GitHub repo → Settings → Webhooks → Add webhook → Payload URL**

```
http://<jenkins_server_public_ip>:8080/github-webhook/
```

> 💡 **Why add the Payload URL?** The Payload URL is GitHub's delivery endpoint; when an event such as a push occurs, GitHub POSTs event data to that URL so Jenkins can automatically trigger the CI pipeline.

When you push code to GitHub, GitHub sends event details to this Jenkins URL. Jenkins receives the request and starts the job configured with **GitHub hook trigger for GITScm polling**.

**🔁 Flow**

1. 👨‍💻 Developer pushes code to GitHub.
2. 🔔 GitHub detects the configured event (e.g. push).
3. 📨 GitHub sends a JSON payload by HTTP POST to the Payload URL.
4. 📥 Jenkins receives it at `/github-webhook/`.
5. ⚡ Jenkins triggers the associated pipeline/build automatically.

---

## 5. ☁️ AWS Setup (EKS + IAM)

> Two parts on the AWS portal: **(1) EKS creation** and **(2) IAM user**.

### 5.1 ☸️ Create the EKS Cluster

**AWS → Amazon EKS → Create EKS Cluster**

- Select **Custom configuration**
- **Disable** *Use EKS Auto Mode*
- **Name:** `cluster1`
- **Cluster IAM role:** `AmazonEKSClusterRole`
- **Kubernetes version:** `1.34` (make sure it is under *standard support*)
- Keep all other steps default and create.

> ⏱️ Takes approximately **10 minutes**.

### 5.2 🔑 Create the IAM User

**AWS → IAM → Users → Create user** → `user1` with **Administrator access**.

Then create access keys for the AWS CLI:

**IAM → Users → user1 → Security credentials → Access keys → Create access key → CLI → Next**

```
Access Key ID     : <YOUR_ACCESS_KEY_ID>
Secret Access Key : <YOUR_SECRET_ACCESS_KEY>
```

> 🔒 **Never commit real keys to GitHub.** Access Key ID and Secret Access Key authenticate programmatic AWS access from the CLI, SDKs, Terraform, or CI/CD tools; the access key identifies the IAM user and the secret key signs the API request.

### 5.3 👷 Create Worker Nodes

**Amazon EKS → Clusters → cluster1 → Compute → Node groups → Add node group**

1. **Node group name:** `NG1`
2. **Node IAM role:** `AmazonEKSNodeRole` (choose *Create recommended role*)
3. **Instance type** & **Node group scaling configuration**
4. Next → **Create**

> ⏱️ Takes approximately **5 minutes**. Keep all other settings default.

### 5.4 🚪 Open Port 443 on the EKS Security Group

The EKS API server always uses **port 443**.

**EKS → Clusters → cluster1 → Networking → Cluster security group → Edit inbound rules → Add rule**

| Field | Value |
|-------|-------|
| Port range | `443` |
| Source | `Anywhere-IPv4` |

Save rules.

---

## 6. 🧰 AWS CLI on Jenkins Server

Running `aws configure` first will show an error because the AWS CLI is **not installed by default** on Ubuntu.

```bash
cd /root
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip
ls
apt update -y
apt install -y unzip
unzip awscliv2.zip
rm -rf awscliv2.zip            # cleanup zip file
/root/aws/install              # AWS CLI v2 installer (run as root)
aws --version                  # verify installation
```

✅ Example output: `aws-cli/2.39.2 Python/3.14.8 Linux/7.0.0-1014-aws exe/x86_64.ubuntu.24`

### 6.1 ⚙️ Configure the CLI

```bash
aws configure
```

| Prompt | Value |
|--------|-------|
| AWS Access Key ID | your `user1` access key |
| AWS Secret Access Key | your `user1` secret key |
| Default region name | `us-east-1` (use the same region as the Jenkins server & EKS cluster) |
| Default output format | `text` |

Cross-check the configuration:

```bash
aws configure list
cd ~/.aws
```

> 📂 Credentials are saved in `~/.aws/credentials`; region and output format are saved in `~/.aws/config`.

### 6.2 🔌 Connect kubectl to the cluster

```bash
aws eks --region us-east-1 update-kubeconfig --name cluster1
```

| Part | Meaning |
|------|---------|
| `aws eks` | Uses the AWS EKS service through the AWS CLI |
| `--region us-east-1` | Looks for the cluster in the N. Virginia region |
| `update-kubeconfig` | Creates/updates the kubeconfig for `kubectl` |
| `--name cluster1` | Targets the EKS cluster named `cluster1` |

---
* "Can it run without installing kubectl on the server?"

 'Yes — the aws eks update-kubeconfig command itself can usually run without kubectl installed, because it only writes/updates the kubeconfig file. 
But you cannot use that configuration to manage the cluster unless kubectl (or another Kubernetes client) is installed and in your PATH.'

---

## 7. 🛠️ eksctl & kubectl Installation

### 7.1 🏗️ Install `eksctl` (on the Jenkins server)

- `eksctl` is the official CLI for Amazon EKS to **create, update, and delete** EKS clusters and node groups.
- It talks to the AWS API to provision cloud infrastructure.
- It simplifies cluster creation by automating many AWS steps: EKS control plane, worker nodes, networking, and IAM roles.

```bash
cd /tmp
curl --silent --location "https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_Linux_amd64.tar.gz" | tar xz -C /tmp
mv /tmp/eksctl /usr/local/bin
eksctl version
```

✅ Example output: `0.231.0`

### 7.2 ⚙️ Install `kubectl` (on the Jenkins server)

- `kubectl` manages the Kubernetes resources running **inside** a cluster.
- It talks to the Kubernetes API to deploy and manage workloads.

It manages objects such as:

- 📦 **Pods** — running containers
- 🚀 **Deployments** — application rollout and scaling
- 🌐 **Services** — network access to pods
- 🗂️ **ConfigMaps and Secrets** — configuration and credentials
- 📈 **Horizontal Pod Autoscalers** — automatic scaling

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x ./kubectl                  # make executable
mv ./kubectl /usr/local/bin/kubectl
kubectl version --client
```

✅ Example output:

```
Client Version: v1.37.1
Kustomize Version: v5.8.1
```

> 📌 After installation, both binaries should be in `/usr/local/bin`.

**🏠 For your Lavish Estates website:**
- Use **eksctl** to create the EKS cluster in AWS.
- Use **kubectl** to deploy the website's Docker container as a Kubernetes Deployment and expose it through a Service or Ingress.

> 🧠 **Simple analogy**
> - 🏗️ `eksctl` = builds and manages the **building** (EKS cluster, nodes, AWS setup)
> - ⚙️ `kubectl` = furnishes and operates the **rooms inside** the building (pods, apps, services)

---

## 8. 🔐 EKS Access Configuration

### 8.1 🪪 Create an IAM Access Entry (AWS Console)

> Allows IAM user `user1` to connect to `cluster1` as Kubernetes user `user1`, with full **cluster-admin** permissions across the entire cluster.

**EKS → Clusters → cluster1 → Access → IAM access entries → Create**

| Field | Value |
|-------|-------|
| IAM principal ARN | `arn:aws:iam::<ACCOUNT_ID>:user/user1` (select the created IAM user) |
| Username (optional) | `user1` |
| Access policy | `AmazonEKSClusterAdminPolicy` |

### 8.2 🔗 Associate the access policy (Jenkins server)

Gives IAM user `user1` full administrator access to the EKS cluster `cluster1` by connecting the user's access entry to AWS's `AmazonEKSClusterAdminPolicy` across the entire cluster.

```bash
aws eks associate-access-policy \
  --region us-east-1 \
  --cluster-name cluster1 \
  --principal-arn arn:aws:iam::<ACCOUNT_ID>:user/user1 \
  --policy-arn arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy \
  --access-scope type=cluster
```

| Flag | Meaning |
|------|---------|
| `aws eks associate-access-policy` | Attaches an EKS access policy to an existing access entry |
| `--region us-east-1` | Runs the command in the N. Virginia region |
| `--cluster-name cluster1` | Targets the EKS cluster `cluster1` |
| `--principal-arn ...` | The IAM user receiving access — here `user1` |
| `--policy-arn ...` | Assigns the cluster administrator permission policy |
| `--access-scope type=cluster` | Applies to the **entire** cluster, not just one namespace |

### 8.3 📋 Give the Jenkins user kubectl access

Copy the admin user's kubectl configuration into Jenkins' home directory and secure it:

```bash
cd /root
ls -a
cd .kube
ls
mkdir -p /var/lib/jenkins/.kube
cp /root/.kube/config /var/lib/jenkins/.kube
chown -R jenkins:jenkins /var/lib/jenkins/.kube
chmod 600 /var/lib/jenkins/.kube/config
aws eks update-kubeconfig --region us-east-1 --name cluster1
kubectl get nodes
```

| Command | Purpose |
|---------|---------|
| `cd /root` | Go to the root user's home directory |
| `ls -a` | List all files, including hidden folders such as `.kube` |
| `cd .kube` | Enter the directory where kubectl stores its cluster-access configuration |
| `ls` | Confirm the `config` file exists |
| `mkdir -p /var/lib/jenkins/.kube` | Create a `.kube` directory for the Jenkins user (`-p` avoids an error if it exists) |
| `cp /root/.kube/config /var/lib/jenkins/.kube` | Copy root's kubeconfig into Jenkins' directory |
| `chown -R jenkins:jenkins /var/lib/jenkins/.kube` | Make Jenkins the owner of that directory and files |
| `chmod 600 /var/lib/jenkins/.kube/config` | Allow only Jenkins to read/write the config file |
| `aws eks update-kubeconfig --region us-east-1 --name cluster1` | Regenerate/update the kubeconfig for the EKS cluster `cluster1` |

> ❓ **Why does Jenkins need this?** `kubectl` normally reads `$HOME/.kube/config`. The Jenkins service runs as the `jenkins` user, so it looks for `/var/lib/jenkins/.kube/config`, not `/root/.kube/config`.
>
> 🔒 **Security one-liner:** You copied the root kubeconfig to Jenkins, changed its ownership to Jenkins, and restricted permissions to `600` so only Jenkins can use the EKS cluster credentials.

### 8.4 ✅ Verify

```bash
kubectl get nodes
```

Output (Jenkins & Kubernetes configured successfully):

```
NAME                            STATUS   ROLES    AGE   VERSION
ip-172-31-20-217.ec2.internal   Ready    <none>   13m   v1.33.13-eks-39aca56
```

---

## 9. 📦 Kubernetes Manifests

Create a `k8s` directory and add the Deployment & Service YAML files.

```bash
mkdir /k8s
cd /k8s
```

### 9.1 🚀 `deployment.yml`

```bash
vim deployment.yml
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: villa-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: villa-app
  template:
    metadata:
      labels:
        app: villa-app
    spec:
      containers:
      - name: villa-container
        image: rushijaguar/docker-repo-5:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 80
```

```bash
kubectl apply -f deployment.yml
```

**📖 Explanation** — This YAML creates a Kubernetes Deployment named `villa-deployment` that runs **2 identical Pods** using your Docker image `rushijaguar/docker-repo-5:latest`.

| YAML part | What it does |
|-----------|--------------|
| `apiVersion: apps/v1` | Kubernetes API version used for Deployment objects |
| `kind: Deployment` | Creates a Deployment, which manages Pods and enables rolling updates/rollbacks |
| `metadata.name: villa-deployment` | The Deployment's name in the cluster |
| `spec.replicas: 2` | Keeps 2 Pods running. If one fails, Kubernetes recreates it |
| `spec.selector.matchLabels.app: villa-app` | Tells the Deployment which Pods it owns (label `app: villa-app`) |
| `spec.template` | The Pod blueprint used to create each replica |
| `template.metadata.labels.app: villa-app` | Label added to each Pod. Must match `selector.matchLabels`, otherwise Kubernetes rejects the Deployment |
| `template.spec.containers` | Defines the container(s) inside each Pod |
| `name: villa-container` | Name of the container inside the Pod |
| `image: rushijaguar/docker-repo-5:latest` | Container image to pull from Docker Hub |
| `imagePullPolicy: Always` | Pulls the image from the registry every time a Pod starts — useful with `latest` |
| `ports.containerPort: 80` | Documents that the container listens on port 80. Does **not** expose the app outside the cluster |

> 💬 A Deployment ensures the desired number of identical Pods run using a Pod template; its selector matches Pod labels, and it handles scaling, self-healing, rolling updates, and rollbacks.

### 9.2 🌐 `service.yml`

```bash
vim service.yml
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: villa-service
spec:
  type: LoadBalancer
  selector:
    app: villa-app
  ports:
    - port: 80
      targetPort: 80
```

```bash
kubectl apply -f service.yml
```

**📖 Explanation** — This YAML creates a Kubernetes Service named `villa-service` that sends incoming traffic on port 80 to Pods labeled `app: villa-app`, which listen on container port 80.

| YAML part | Meaning |
|-----------|---------|
| `apiVersion: v1` | API version for core Kubernetes objects such as Service |
| `kind: Service` | A stable network endpoint that routes traffic to matching Pods |
| `metadata.name: villa-service` | Name of the Service inside the cluster |
| `type: LoadBalancer` | Asks the cloud provider to create an external load balancer with an externally accessible address (works on EKS, GKE, AKS) |
| `selector.app: villa-app` | Selects the backend Pods — any Pod with label `app: villa-app` receives traffic |
| `ports.port: 80` | Port exposed by the Service/load balancer. Clients connect here |
| `ports.targetPort: 80` | Port on the Pod/container where traffic is forwarded. Your container must listen here |

> 💬 A LoadBalancer Service selects Pods by label, provides a stable Service IP, and provisions a cloud external load balancer that forwards traffic from the Service port to the Pods' target port.

---

## 10. 🐳 Docker Hub & Jenkins Credentials

### 10.1 📦 Docker Hub repository

Create a repository on Docker Hub: **`docker-repo-5`**

> ⚠️ The repository name should match the name mentioned in the Jenkins pipeline.

### 10.2 🔑 Add credentials in Jenkins

**🐳 DockerHub credentials**
`Jenkins Dashboard → Manage Jenkins → Credentials → Add → Username with password` → add your Docker Hub username & password, and set the **ID** exactly as used in the pipeline (`dockerhub`).

**🔌 Install the AWS Credentials plugin**
`Jenkins Dashboard → Manage Jenkins → Plugins → Available plugins` → search **AWS Credentials** → install.

**☁️ AWS credentials**
`Jenkins Dashboard → Manage Jenkins → Credentials → Add → AWS Credentials` → set the **ID** as used in the pipeline (`aws-cred`) → add the Access Key and Secret Access Key of `user1` created with IAM.

---

## 11. 🚀 Jenkins Pipeline

### 11.1 🧱 Create the job

`Jenkins → New Item → name: job1 → Pipeline`

1. Tick **GitHub project** and add the GitHub repo URL.
2. Under **Triggers**, enable **GitHub hook trigger for GITScm polling**.
3. Add the pipeline script below.

### 11.2 📜 Pipeline script

```groovy
pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "rushijaguar/docker-repo-5"
        IMAGE_TAG    = "${BUILD_NUMBER}"
        AWS_REGION   = "us-east-1"
        CLUSTER_NAME = "cluster1"
        K8S_DIR      = "k8s"
    }

    stages {

        stage('Clone Code') {
            steps {
                git 'https://github.com/sangmesh4/Devops-project-2.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                docker build -t $DOCKER_IMAGE:$IMAGE_TAG .
                docker tag $DOCKER_IMAGE:$IMAGE_TAG $DOCKER_IMAGE:latest
                """
            }
        }

        stage('Push to DockerHub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    docker push $DOCKER_IMAGE:$IMAGE_TAG
                    docker push $DOCKER_IMAGE:latest
                    """
                }
            }
        }

        stage('Configure AWS & EKS') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-cred'
                ]]) {
                    sh """
                    export AWS_DEFAULT_REGION=$AWS_REGION

                    aws sts get-caller-identity

                    aws eks update-kubeconfig \
                        --region $AWS_REGION \
                        --name $CLUSTER_NAME
                    """
                }
            }
        }

        stage('Deploy to EKS') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-cred'
                ]]) {
                    sh """
                    export AWS_DEFAULT_REGION=$AWS_REGION

                    kubectl apply -f $K8S_DIR/ --validate=false

                    kubectl set image deployment/villa-deployment \
                        villa-container=$DOCKER_IMAGE:$IMAGE_TAG

                    kubectl rollout status deployment/villa-deployment
                    """
                }
            }
        }
    }

    post {
        success {
            echo "Deployment Successful"
        }
        failure {
            echo "Deployment Failed"
        }
    }
}
```

### 11.3 🧠 Pipeline explained (easy way)

This pipeline is a CI/CD automation script. It takes your code from GitHub, packages it into a Docker image, uploads it to DockerHub, and deploys it on an AWS Kubernetes cluster (EKS) — all automatically.

**⚡ Simple flow:** `GitHub → Build Image → Push to DockerHub → Connect to AWS EKS → Deploy`

**1️⃣ `pipeline` and `agent any`**
- `pipeline` marks the start of a Jenkins pipeline.
- `agent any` means "run this on any available Jenkins machine."

**2️⃣ `environment` block (variables)**

| Variable | Meaning |
|----------|---------|
| `DOCKER_IMAGE` | Your DockerHub repo name |
| `IMAGE_TAG` | Jenkins build number (1, 2, 3 …) used as the version tag |
| `AWS_REGION` | AWS region where your cluster is |
| `CLUSTER_NAME` | Name of your EKS cluster |
| `K8S_DIR` | Folder in the repo that contains the Kubernetes YAML files |

> Example: if the build number is `1`, then `IMAGE_TAG=1` and the Docker image becomes `rushijaguar/docker-repo-5:1`.

**3️⃣ Stage 1 — Clone Code**
Downloads your project code from GitHub into Jenkins. The URL must be a **plain URL** (not Markdown `[text](link)` format), otherwise this stage fails.

**4️⃣ Stage 2 — Build Docker Image**
- First command builds an image using the Dockerfile in your repo (e.g. `rushijaguar/docker-repo-5:12`).
- Second command also tags the same image as `latest`.
- Result: two tags on the same image — a version number and `latest`.

**5️⃣ Stage 3 — Push to DockerHub**
- Jenkins safely pulls your DockerHub username and password from saved credentials (ID: `dockerhub`), so they are never written in the code.
- Logs into DockerHub, then uploads both image tags.

**6️⃣ Stage 4 — Configure AWS & EKS**
- Uses your saved AWS access key and secret from Jenkins (`aws-cred`).
- `aws sts get-caller-identity` checks that the AWS login works (shows which account you're using).
- `aws eks update-kubeconfig` sets up `kubectl` so it can talk to your EKS cluster `cluster1` — think of it as "connecting to the cluster."
- ⚠️ Note the space before the line-continuation backslash: `--region $AWS_REGION \`

**7️⃣ Stage 5 — Deploy to EKS**
- `kubectl apply -f $K8S_DIR/ --validate=false` applies all YAML files in the `k8s` folder (deployment, service, etc.). `--validate=false` skips schema validation.
- ⚠️ Use `$K8S_DIR/` (relative to the workspace), **not** `/$K8S_DIR/` which resolves to the absolute path `/k8s/` on the machine.
- `kubectl set image deployment/villa-deployment villa-container=$DOCKER_IMAGE:$IMAGE_TAG` updates the running deployment to the new image version. The deployment name and container name must match your YAML.
- `kubectl rollout status deployment/villa-deployment` waits and shows whether the rollout succeeded (new pods came up healthy).

**8️⃣ `post` block**
Prints a message depending on whether the pipeline passed or failed.

### 11.4 📋 Summary

This Jenkins pipeline automates the complete DevOps workflow:

- a) 📥 Clone application code from GitHub
- b) 🐳 Build a Docker image
- c) 📤 Push the image to DockerHub
- d) ☁️ Configure AWS and connect to the EKS cluster
- e) ☸️ Deploy the application to Kubernetes (EKS)

---

## 12. ✅ Run, Verify & Update Workflow

1. ▶️ **First time:** run the job manually and access the site using the **Load Balancer DNS**.
2. 🌍 *(Optional)* Attach the Load Balancer DNS to a custom domain.
3. ✏️ Make changes in `index.html` on the development server.
4. 📂 Move the file to the staging area and local repository (`git add` / `git commit`).
5. 🔼 Push the changes to the GitHub repository.
6. ⚡ This triggers the webhook, and the Jenkins job builds automatically.
7. 👀 View the updated site using the Load Balancer DNS.

---

## 13. 🐚 Working Inside a Pod

To enter a Kubernetes pod:

```bash
kubectl exec -it <pod-name> -- /bin/bash

apt update -y
apt install -y vim

vim /var/www/html/index.html        # make changes in index.html
```

🔁 Repeat the same process for the second pod and access it using the Load Balancer DNS.

> ⚠️ Changes made inside a pod are temporary — they are lost when the pod is recreated. Use the Git → Jenkins pipeline for permanent changes.

---

## 14. 🧹 Cleanup (Avoid Unnecessary AWS Bills)

Delete the project setup in this order:

1. 📉 **Auto Scaling Group**
2. ☸️ **EKS** → Node groups → Cluster
3. 🖥️ **EC2 instances**
4. 👤 **IAM user** (and its access keys)

---

## 15. 📝 Notes & Fixes

Inconsistencies found in the practiced project, corrected in this README:

| # | Issue in original | ✅ Used here |
|---|-------------------|-------------|
| 1 | Region mentioned as both `us-east-1` and `us-east-2` | `us-east-1` everywhere |
| 2 | Cluster named `cluster1`, `cluster_27_dev2project`, `cluster_27project` in different places | `cluster1` |
| 3 | Resource names mixed (`villa-*`, `waso-*`, `fashion-*`) | `villa-deployment`, `villa-container`, `villa-service`, `villa-app` |
| 4 | Docker repo mentioned as `rushijaguar` and `lekharaj` | `rushijaguar/docker-repo-5` |
| 5 | Pipeline used `/$K8S_DIR/` (absolute path) | `$K8S_DIR/` |
| 6 | Jenkins apt source `echo` had a misplaced quote | Quote closed after the repo URL |
| 7 | `InitialAdminPassword` filename | `initialAdminPassword` (Linux is case-sensitive) |
| 8 | Real access keys, secret key, and Jenkins password were in the notes | Replaced with placeholders |

---

<div align="center">

### ⭐ If this project helped you, give the repo a star! ⭐

Made with ❤️ using **Git · GitHub · Jenkins · Docker · Kubernetes · AWS** for **DevOps ♾️ community**

</div>
