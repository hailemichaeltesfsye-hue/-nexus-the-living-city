"""
NEXUS: The Living City — Modal Serverless Inference Endpoint
Meta Global AI Developer Hackathon ($150,000 Prize Track)
Model: Meta Llama 3.3 70B Instruct / Llama 3.1 8B Instruct with vLLM
Workspace: hailemichaeltesfsye

Usage:
  1. pip install modal
  2. modal token new (or modal setup)
  3. modal deploy modal_llama.py

After deployment, Modal gives you a web endpoint:
  https://hailemichaeltesfsye--nexus-llama-endpoint.modal.run
Copy this URL into Vercel as VITE_MODAL_ENDPOINT_URL.
"""

import os
from typing import Optional
from pydantic import BaseModel
import modal

# 1. Define the Modal App
app = modal.App("nexus-llama-endpoint")

# 2. Container image with vLLM and huggingface_hub
vllm_image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "vllm>=0.6.3",
        "huggingface_hub[hf_transfer]>=0.26.0",
        "fastapi[standard]>=0.115.0",
        "pydantic>=2.0.0",
    )
    .env({"HF_HUB_ENABLE_HF_TRANSFER": "1"})
)

MODEL_ID = "meta-llama/Llama-3.3-70B-Instruct"
# Alternative fast fallback for low cold-start testing:
# MODEL_ID = "meta-llama/Llama-3.1-8B-Instruct"

# 3. Model storage volume for fast persistent cache
model_volume = modal.Volume.from_name("nexus-llama-weights", create_if_missing=True)

class InferenceRequest(BaseModel):
    prompt: str
    system_prompt: Optional[str] = "You are the NEXUS Autonomous Urban Intelligence engine for Addis Ababa."
    max_tokens: Optional[int] = 512
    temperature: Optional[float] = 0.7
    model: Optional[str] = MODEL_ID

class InferenceResponse(BaseModel):
    ok: bool
    text: str
    model: str
    usage: dict

@app.cls(
    image=vllm_image,
    gpu="H100",  # or "A100" / "A10G" based on available quota
    volumes={"/root/.cache/huggingface": model_volume},
    timeout=600,
    container_idle_timeout=120,
    secrets=[modal.Secret.from_name("huggingface-secret", required_keys=["HF_TOKEN"])],
)
class LlamaServer:
    @modal.enter()
    def load_model(self):
        from vllm import LLM, SamplingParams
        print(f"Loading {MODEL_ID} into vLLM engine...")
        self.llm = LLM(
            model=MODEL_ID,
            tensor_parallel_size=1,
            gpu_memory_utilization=0.92,
            max_model_len=4096,
            trust_remote_code=True,
        )
        self.SamplingParams = SamplingParams

    @modal.fastapi_endpoint(method="POST")
    def generate(self, req: InferenceRequest) -> InferenceResponse:
        full_prompt = (
            f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n"
            f"{req.system_prompt}<|eot_id|>"
            f"<|start_header_id|>user<|end_header_id|>\n\n"
            f"{req.prompt}<|eot_id|>"
            f"<|start_header_id|>assistant<|end_header_id|>\n\n"
        )
        params = self.SamplingParams(
            temperature=req.temperature,
            max_tokens=req.max_tokens,
            stop=["<|eot_id|>"],
        )
        outputs = self.llm.generate([full_prompt], params)
        generated_text = outputs[0].outputs[0].text.strip()
        completion_tokens = len(outputs[0].outputs[0].token_ids)

        return InferenceResponse(
            ok=True,
            text=generated_text,
            model=MODEL_ID,
            usage={"completion_tokens": completion_tokens},
        )
