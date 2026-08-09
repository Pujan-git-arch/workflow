from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="WorkFlow API")


@app.get("/health")
def health():
    return {"status": "ok"}