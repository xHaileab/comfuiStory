# ComfyUI Serverless Deployment on RunPod

[![Runpod](https://api.runpod.io/badge/xHaileab/comfuiStory)](https://console.runpod.io/hub/xHaileab/comfuiStory)

This repository provides a complete template for deploying a sophisticated ComfyUI image editing workflow as a scalable, serverless API endpoint using RunPod. It includes a pre-configured Docker environment, a Python handler for processing requests, and all the necessary scripts to get you started quickly.

This repository also contains a frontend React application in `/` to visualize and inspect the `workflow.json`.

## Features

-   **Scalable & Cost-Effective**: Leverages RunPod's serverless platform to scale from zero to handle high demand, ensuring you only pay for what you use.
-   **Pre-configured Workflow**: Includes a ready-to-use Qwen Image Edit workflow for high-quality image manipulation.
-   **Customizable**: Easily swap out the workflow, models, or handler logic to fit your own needs.
-   **Optimized for Cold Starts**: Models are pre-downloaded into the Docker image to minimize startup times.

---

## Deployment Guide

Follow these steps to build the Docker container and deploy it on RunPod.

### Prerequisites

-   A [Docker](https://www.docker.com/products/docker-desktop/) installation.
-   A [RunPod](https://runpod.io/) account.
-   A container registry (e.g., [Docker Hub](https://hub.docker.com/)).

### Step 1: Build the Docker Image

Navigate to the project's root directory in your terminal and run the build command. Replace `your-username` with your Docker Hub username.

```bash
docker build -t your-username/comfyui-qwen-serverless:latest .
```

This process will take some time as it installs dependencies and downloads several gigabytes of models.

### Step 2: Push the Image to a Registry

Once the build is complete, push the image to your container registry.

```bash
docker push your-username/comfyui-qwen-serverless:latest
```

### Step 3: Create a RunPod Template

1.  Log in to your RunPod account.
2.  Navigate to **Serverless > Templates** from the left-hand menu.
3.  Click **New Template**.
4.  Configure the template:
    -   **Template Name**: Give it a descriptive name, like `comfyui-qwen-template`.
    -   **Container Image**: Enter the name of the image you just pushed (e.g., `your-username/comfyui-qwen-serverless:latest`).
    -   **Container Disk**: Set to at least **15 GB** to accommodate the models.
    -   **GPU Type**: Select a suitable GPU. An **NVIDIA RTX A4000** is a good starting point.
5.  Click **Save Template**.

### Step 4: Create a Serverless Endpoint

1.  Navigate to **Serverless > Endpoints** from the left-hand menu.
2.  Click **New Endpoint**.
3.  Configure the endpoint:
    -   **Endpoint Name**: Name your API endpoint.
    -   **Select Template**: Choose the template you created in the previous step.
    -   **Workers**: Set the minimum and maximum number of concurrent workers based on your expected load. You can start with Min: 0, Max: 3.
    -   **Idle Timeout**: Set a timeout for idle workers (e.g., 5 minutes).
4.  Click **Create Endpoint**.

Your API is now deploying! Once it's ready, you'll have an API URL to send requests to.

---

## API Usage

You can interact with your new endpoint using any HTTP client.

### Request Format

Send a `POST` request to your endpoint's URL. The body must be a JSON object containing the prompt.

**Endpoint URL:** `https://api.runpod.ai/v2/{YOUR_ENDPOINT_ID}/runsync`

**Body:**

```json
{
  "input": {
    "prompt": "A majestic lion wearing a crown, cinematic lighting"
  }
}
```

### Example cURL Request

Replace `{YOUR_ENDPOINT_ID}` and `{YOUR_RUNPOD_API_KEY}` with your actual credentials.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {YOUR_RUNPOD_API_KEY}" \
  -d '{
    "input": {
      "prompt": "A robot playing a grand piano on a futuristic city rooftop"
    }
  }' \
  https://api.runpod.ai/v2/{YOUR_ENDPOINT_ID}/runsync
```

### Response Format

A successful request will return a JSON object containing the base64-encoded output image.

```json
{
  "id": "some-job-id",
  "status": "COMPLETED",
  "output": {
    "image_b64": "iVBORw0KGgoAAAANSUhEUgA... (long base64 string) ..."
  }
}
```