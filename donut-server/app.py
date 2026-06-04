import base64
import io
import json
import os
import re

from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from PIL import Image
import torch
from transformers import DonutProcessor, VisionEncoderDecoderModel

MODEL_PATH = os.environ.get("MODEL_PATH", "/model")
TASK_TOKEN = "<s_receipt>"
API_KEY = os.environ.get("DONUT_API_KEY", "")
MAX_LENGTH = 768
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

app = FastAPI()
processor: DonutProcessor = None
model: VisionEncoderDecoderModel = None


@app.on_event("startup")
def load_model():
    global processor, model
    print(f"Loading Donut model from {MODEL_PATH} on {DEVICE}...")
    processor = DonutProcessor.from_pretrained(MODEL_PATH)
    model = VisionEncoderDecoderModel.from_pretrained(MODEL_PATH).to(DEVICE)
    model.eval()
    print("Model ready.")


class ExtractRequest(BaseModel):
    image: str         # base64-encoded image bytes
    content_type: str = "image/jpeg"


def _pdf_first_page(image_bytes: bytes) -> Image.Image:
    try:
        from pdf2image import convert_from_bytes
        pages = convert_from_bytes(image_bytes, first_page=1, last_page=1, dpi=200)
        return pages[0].convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"PDF conversion failed: {exc}")


def _run_inference(image: Image.Image) -> dict:
    pixel_values = processor(image.convert("RGB"), return_tensors="pt").pixel_values.to(DEVICE)
    decoder_ids = processor.tokenizer(
        TASK_TOKEN, add_special_tokens=False, return_tensors="pt"
    ).input_ids.to(DEVICE)

    with torch.no_grad():
        outputs = model.generate(
            pixel_values,
            decoder_input_ids=decoder_ids,
            max_length=MAX_LENGTH,
            pad_token_id=processor.tokenizer.pad_token_id,
            eos_token_id=processor.tokenizer.eos_token_id,
            use_cache=True,
            bad_words_ids=[[processor.tokenizer.unk_token_id]],
            return_dict_in_generate=True,
        )

    seq = processor.batch_decode(outputs.sequences)[0]
    seq = seq.replace(processor.tokenizer.eos_token, "").replace(processor.tokenizer.pad_token, "")
    seq = re.sub(r"^.*?" + re.escape(TASK_TOKEN), "", seq).strip()

    try:
        return json.loads(seq)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", seq, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
        raise HTTPException(status_code=422, detail=f"Model output could not be parsed: {seq[:300]}")


@app.post("/extract")
def extract(req: ExtractRequest, x_api_key: str = Header(default="")):
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

    raw_bytes = base64.b64decode(req.image)
    content_type = req.content_type.lower()

    image = _pdf_first_page(raw_bytes) if content_type == "application/pdf" else Image.open(io.BytesIO(raw_bytes))
    return _run_inference(image)


@app.get("/health")
def health():
    return {"status": "ok", "device": str(DEVICE), "model_loaded": model is not None}
