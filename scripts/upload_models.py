#!/usr/bin/env python3
"""
모델 업로드 스크립트
PKL 파일을 시스템에 업로드하고 등록
"""

import os
import sys
import requests
import json
from pathlib import Path

# API 서버 설정
API_BASE_URL = "http://localhost:8001"

def upload_model(model_path: str, model_name: str, model_type: str):
    """모델 업로드"""
    try:
        if not os.path.exists(model_path):
            print(f"[ERROR] Model file not found: {model_path}")
            return False
        
        # 모델 파일 크기 확인
        file_size = os.path.getsize(model_path)
        print(f"[INFO] Model file size: {file_size / (1024*1024):.2f} MB")
        
        # API 요청 데이터
        data = {
            "model_name": model_name,
            "model_type": model_type,
            "model_path": model_path
        }
        
        # API 호출
        response = requests.post(
            f"{API_BASE_URL}/api/ml/models/upload",
            json=data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"[SUCCESS] Model uploaded: {result['message']}")
            return True
        else:
            print(f"[ERROR] Upload failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Upload failed: {e}")
        return False

def load_models_from_directory(models_dir: str):
    """디렉토리에서 모든 PKL 파일 로드"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/ml/models/load-from-directory",
            params={"models_dir": models_dir},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"[SUCCESS] {result['message']}")
            return True
        else:
            print(f"[ERROR] Load failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Load failed: {e}")
        return False

def list_models():
    """등록된 모델 목록 조회"""
    try:
        response = requests.get(f"{API_BASE_URL}/api/ml/models")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n[INFO] Registered Models ({result['total_count']}):")
            print("-" * 80)
            
            for model in result['models']:
                status = "ACTIVE" if model['is_active'] else "INACTIVE"
                size_mb = model['model_size'] / (1024*1024) if model['model_size'] else 0
                
                print(f"📦 {model['model_name']}")
                print(f"   Type: {model['model_type']}")
                print(f"   Version: {model['model_version']}")
                print(f"   Accuracy: {model['accuracy_score']:.4f}")
                print(f"   Size: {size_mb:.2f} MB")
                print(f"   Status: {status}")
                print(f"   Training Date: {model['training_date']}")
                print()
            
            return True
        else:
            print(f"[ERROR] Failed to list models: {response.text}")
            return False
            
    except Exception as e:
        print(f"[ERROR] List failed: {e}")
        return False

def test_sentiment_analysis():
    """감정 분석 테스트"""
    try:
        test_text = "This video is absolutely amazing! I love it so much!"
        
        data = {
            "text": test_text,
            "model_name": "sentiment_model"
        }
        
        response = requests.post(
            f"{API_BASE_URL}/api/ml/sentiment",
            json=data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"[SUCCESS] Sentiment Analysis Test:")
            print(f"   Text: {test_text}")
            print(f"   Sentiment: {result['sentiment_label']}")
            print(f"   Score: {result['sentiment_score']:.4f}")
            print(f"   Confidence: {result['confidence']:.4f}")
            return True
        else:
            print(f"[ERROR] Sentiment test failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Sentiment test failed: {e}")
        return False

def test_topic_modeling():
    """토픽 모델링 테스트"""
    try:
        test_text = "Machine learning and artificial intelligence are transforming the world"
        
        data = {
            "text": test_text,
            "model_name": "topic_model"
        }
        
        response = requests.post(
            f"{API_BASE_URL}/api/ml/topics",
            json=data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"[SUCCESS] Topic Modeling Test:")
            print(f"   Text: {test_text}")
            print(f"   Topics: {len(result['topics'])} found")
            for topic in result['topics']:
                print(f"     - {topic['topic_name']}: {topic['probability']:.4f}")
            return True
        else:
            print(f"[ERROR] Topic test failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Topic test failed: {e}")
        return False

def test_recommendations():
    """추천 시스템 테스트"""
    try:
        data = {
            "user_id": "test_user_123",
            "model_name": "recommendation_model",
            "num_recommendations": 5
        }
        
        response = requests.post(
            f"{API_BASE_URL}/api/ml/recommendations",
            json=data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"[SUCCESS] Recommendation Test:")
            print(f"   User: {result['user_id']}")
            print(f"   Recommendations: {result['total_count']}")
            for i, rec in enumerate(result['recommendations'][:3], 1):
                print(f"     {i}. {rec.get('title', 'N/A')} (Score: {rec.get('score', 0):.4f})")
            return True
        else:
            print(f"[ERROR] Recommendation test failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Recommendation test failed: {e}")
        return False

def main():
    """메인 함수"""
    print("🚀 YouTube Analytics - Model Integration Script")
    print("=" * 60)
    
    # 1. 모델 디렉토리 확인
    models_dir = "models"
    if not os.path.exists(models_dir):
        print(f"[WARNING] Models directory not found: {models_dir}")
        print("Creating models directory...")
        os.makedirs(models_dir, exist_ok=True)
        print(f"[INFO] Please place your PKL files in: {os.path.abspath(models_dir)}")
        return
    
    # 2. PKL 파일 찾기
    pkl_files = list(Path(models_dir).glob("*.pkl"))
    if not pkl_files:
        print(f"[WARNING] No PKL files found in {models_dir}")
        print("Please place your model files in the models directory:")
        print("  - sentiment_model.pkl")
        print("  - topic_model.pkl") 
        print("  - recommendation_model.pkl")
        return
    
    print(f"[INFO] Found {len(pkl_files)} PKL files:")
    for pkl_file in pkl_files:
        print(f"  - {pkl_file.name}")
    
    # 3. 모델 업로드
    print("\n📤 Uploading models...")
    for pkl_file in pkl_files:
        model_name = pkl_file.stem
        model_type = "classification"  # 기본값
        
        # 모델 타입 추정
        if "sentiment" in model_name.lower():
            model_type = "sentiment"
        elif "topic" in model_name.lower():
            model_type = "topic_modeling"
        elif "recommend" in model_name.lower():
            model_type = "recommendation"
        
        success = upload_model(str(pkl_file), model_name, model_type)
        if not success:
            print(f"[ERROR] Failed to upload {model_name}")
    
    # 4. 모델 목록 확인
    print("\n📋 Checking registered models...")
    list_models()
    
    # 5. API 테스트
    print("\n🧪 Testing ML APIs...")
    test_sentiment_analysis()
    test_topic_modeling()
    test_recommendations()
    
    print("\n✅ Model integration completed!")
    print("\n📚 Available API endpoints:")
    print("  POST /api/ml/sentiment - 감정 분석")
    print("  POST /api/ml/topics - 토픽 모델링")
    print("  POST /api/ml/recommendations - 추천 생성")
    print("  GET  /api/ml/models - 모델 목록")
    print("  GET  /api/ml/health - 서비스 상태")

if __name__ == "__main__":
    main()
