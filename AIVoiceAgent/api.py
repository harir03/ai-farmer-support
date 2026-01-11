from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from livekit import api
import os
from dotenv import load_dotenv
import uuid

load_dotenv()

app = FastAPI()

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TokenRequest(BaseModel):
    room_name: str
    participant_name: str

class TokenResponse(BaseModel):
    token: str
    url: str
    room_name: str

# GET endpoint for simple/quick access (like your original Next.js code)
@app.get("/token", response_model=TokenResponse)
async def create_token_get(
    userId: str = Query(default_factory=lambda: str(uuid.uuid4())),
    room_name: str = Query(default_factory=lambda: str(uuid.uuid4()))
):
    try:
        api_key = os.getenv("LIVEKIT_API_KEY")
        api_secret = os.getenv("LIVEKIT_API_SECRET")
        livekit_url = os.getenv("LIVEKIT_URL")
        
        if not all([api_key, api_secret, livekit_url]):
            raise HTTPException(status_code=500, detail="LiveKit credentials not configured")
        
        # Generate access token with more comprehensive grants
        token = api.AccessToken(api_key, api_secret) \
            .with_identity(userId) \
            .with_name(userId) \
            .with_grants(api.VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_publish_data=True,
                can_subscribe=True,
                can_update_own_metadata=True,
            ))
        
        jwt_token = token.to_jwt()
        
        return TokenResponse(
            token=jwt_token,
            url=livekit_url,
            room_name=room_name
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# POST endpoint for more complex scenarios
@app.post("/token", response_model=TokenResponse)
async def create_token(request: TokenRequest):
    try:
        # Get LiveKit credentials from environment variables
        api_key = os.getenv("LIVEKIT_API_KEY")
        api_secret = os.getenv("LIVEKIT_API_SECRET")
        livekit_url = os.getenv("LIVEKIT_URL")
        
        if not all([api_key, api_secret, livekit_url]):
            raise HTTPException(status_code=500, detail="LiveKit credentials not configured")
        
        # Generate access token
        token = api.AccessToken(api_key, api_secret) \
            .with_identity(request.participant_name) \
            .with_name(request.participant_name) \
            .with_grants(api.VideoGrants(
                room_join=True,
                room=request.room_name,
                can_publish=True,
                can_publish_data=True,
                can_subscribe=True,
                can_update_own_metadata=True,
            ))
        
        jwt_token = token.to_jwt()
        
        return TokenResponse(
            token=jwt_token,
            url=livekit_url,
            room_name=request.room_name
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI server!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)