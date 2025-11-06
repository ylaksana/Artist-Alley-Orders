"""
Trend Analysis Backend API
Simple FastAPI server for data upload and AI analysis
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
from datetime import datetime
from typing import Dict, Any, Optional
import uuid

# Initialize FastAPI app
app = FastAPI(title="Artist Alley API")

# Enable CORS for React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your app's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (we'll add database later)
datasets = {}

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "message": "Artist Alley API",
        "version": "1.0.0"
    }


# 
@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """
    Upload a CSV or Excel file
    Returns dataset ID and preview
    """
    try:
        # Read file contents
        contents = await file.read()
        
        # Parse based on file type
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Please upload CSV or Excel files."
            )
        
        # Generate unique dataset ID
        dataset_id = str(uuid.uuid4())
        
        # Store dataset
        datasets[dataset_id] = {
            "filename": file.filename,
            "dataframe": df,
            "uploaded_at": datetime.now().isoformat(),
            "row_count": len(df),
            "column_count": len(df.columns)
        }
        
        # Return preview
        return {
            "dataset_id": dataset_id,
            "filename": file.filename,
            "columns": df.columns.tolist(),
            "row_count": len(df),
            "column_count": len(df.columns),
            "preview": df.head(5).to_dict('records'),
            "column_types": df.dtypes.astype(str).to_dict()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze/{dataset_id}")
async def analyze_trends(
    dataset_id: str,
    query: Optional[str] = None
):
    """
    Analyze trends in a dataset
    For now, returns basic statistics
    We'll add AI integration in the next step
    """
    try:
        # Check if dataset exists
        if dataset_id not in datasets:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        df = datasets[dataset_id]["dataframe"]
        
        # Calculate basic statistics
        stats = calculate_statistics(df)
        
        # Detect trends
        trends = detect_basic_trends(df)
        
        # Generate summary
        summary = generate_summary(df, trends)
        
        return {
            "dataset_id": dataset_id,
            "summary": summary,
            "statistics": stats,
            "trends": trends,
            "analyzed_at": datetime.now().isoformat(),
            "source": "basic_analysis"  # Will change to "ai" later
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/datasets")
async def list_datasets():
    """List all uploaded datasets"""
    return {
        "datasets": [
            {
                "id": dataset_id,
                "filename": data["filename"],
                "uploaded_at": data["uploaded_at"],
                "row_count": data["row_count"],
                "column_count": data["column_count"]
            }
            for dataset_id, data in datasets.items()
        ]
    }


@app.delete("/api/datasets/{dataset_id}")
async def delete_dataset(dataset_id: str):
    """Delete a dataset"""
    if dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    del datasets[dataset_id]
    return {"message": "Dataset deleted successfully"}


# Helper functions

def calculate_statistics(df: pd.DataFrame) -> Dict[str, Any]:
    """Calculate basic statistics for numeric columns"""
    stats = {}
    
    numeric_columns = df.select_dtypes(include=['number']).columns
    
    for column in numeric_columns:
        col_data = df[column].dropna()
        
        if len(col_data) > 0:
            stats[column] = {
                "mean": float(col_data.mean()),
                "median": float(col_data.median()),
                "std": float(col_data.std()) if len(col_data) > 1 else 0,
                "min": float(col_data.min()),
                "max": float(col_data.max()),
                "count": int(len(col_data))
            }
            
            # Calculate growth rate if enough data
            if len(col_data) > 1:
                first_val = col_data.iloc[0]
                last_val = col_data.iloc[-1]
                
                if first_val != 0:
                    growth_rate = ((last_val - first_val) / first_val) * 100
                    stats[column]["growth_rate"] = float(growth_rate)
    
    return stats


def detect_basic_trends(df: pd.DataFrame) -> list:
    """Detect basic trends in numeric columns"""
    trends = []
    
    numeric_columns = df.select_dtypes(include=['number']).columns
    
    for column in numeric_columns:
        col_data = df[column].dropna()
        
        if len(col_data) < 2:
            continue
        
        # Calculate trend direction
        first_val = col_data.iloc[0]
        last_val = col_data.iloc[-1]
        
        if first_val == 0:
            change_percent = 0
        else:
            change_percent = ((last_val - first_val) / first_val) * 100
        
        # Determine direction
        if abs(change_percent) < 5:
            direction = "stable"
            emoji = "➡️"
        elif change_percent > 0:
            direction = "increasing"
            emoji = "📈"
        else:
            direction = "decreasing"
            emoji = "📉"
        
        trends.append({
            "column": column,
            "direction": direction,
            "change_percent": round(change_percent, 2),
            "description": f"{column} is {direction} by {abs(round(change_percent, 2))}%",
            "emoji": emoji,
            "confidence": 0.8  # Placeholder
        })
    
    return trends


def generate_summary(df: pd.DataFrame, trends: list) -> str:
    """Generate a text summary of the analysis"""
    n_rows = len(df)
    n_cols = len(df.columns)
    numeric_cols = len(df.select_dtypes(include=['number']).columns)
    
    summary = f"Dataset contains {n_rows} rows and {n_cols} columns ({numeric_cols} numeric). "
    
    if trends:
        increasing = [t for t in trends if t["direction"] == "increasing"]
        decreasing = [t for t in trends if t["direction"] == "decreasing"]
        
        if increasing:
            summary += f"Increasing trends detected in: {', '.join([t['column'] for t in increasing])}. "
        if decreasing:
            summary += f"Decreasing trends detected in: {', '.join([t['column'] for t in decreasing])}. "
    
    return summary


# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)