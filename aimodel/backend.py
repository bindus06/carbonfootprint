from fastapi import FastAPI, UploadFile, File
import torch
import torch.nn as nn
import io
from PIL import Image
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
cred = credentials.Certificate("firebase_credentials.json")  # 🔴 Add your Firebase JSON key here
firebase_admin.initialize_app(cred)
db = firestore.client()

# FastAPI app
app = FastAPI()

# AI Model (Eco Score Predictor)
class EcoScoreModel(nn.Module):
    def __init__(self):
        super(EcoScoreModel, self).__init__()
        self.fc1 = nn.Linear(3, 16)
        self.fc2 = nn.Linear(16, 8)
        self.fc3 = nn.Linear(8, 1)
        self.relu = nn.ReLU()

    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.relu(self.fc2(x))
        x = self.fc3(x)
        return x

# Load Trained Model
model = EcoScoreModel()
model.load_state_dict(torch.load("eco_score_model.pth"))  # 🔴 Load your trained model
model.eval()

# Function to predict Eco Score
def predict_eco_score(material, carbon_footprint, recyclable):
    material_encoded = 1 if material.lower() == "bamboo" else 0  # Example encoding
    recyclable_encoded = 1 if recyclable.lower() == "yes" else 0
    input_tensor = torch.tensor([[material_encoded, carbon_footprint, recyclable_encoded]], dtype=torch.float32)

    with torch.no_grad():
        score = model(input_tensor).item()

    return round(score, 2)

# API to receive product data
@app.post("/predict")
async def predict_product(material: str, carbon_footprint: float, recyclable: str):
    score = predict_eco_score(material, carbon_footprint, recyclable)

    # Store in Firebase
    product_data = {"material": material, "carbon_footprint": carbon_footprint, "recyclable": recyclable, "eco_score": score}
    db.collection("products").add(product_data)

    return {"eco_score": score}

# Run the server
# Run `uvicorn backend:app --reload` in terminal
