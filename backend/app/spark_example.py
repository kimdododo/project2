"""
Spark 사용 예제 API
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any, List
import logging
from .spark_client import get_spark_session, process_data_with_spark, spark_client
from .kafka_client import send_to_kafka, consume_from_kafka
import json

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/spark", tags=["spark"])

@router.get("/status")
async def spark_status():
    """
    Spark 클러스터 상태 확인
    """
    try:
        spark = get_spark_session()
        sc = spark.sparkContext
        
        return {
            "status": "connected",
            "app_name": spark.conf.get("spark.app.name"),
            "master": spark.conf.get("spark.master"),
            "version": spark.version,
            "default_parallelism": sc.defaultParallelism,
            "executor_memory": spark.conf.get("spark.executor.memory"),
            "driver_memory": spark.conf.get("spark.driver.memory")
        }
    except Exception as e:
        logger.error(f"Error checking Spark status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process/videos")
async def process_videos_with_spark(videos_data: List[Dict[str, Any]]):
    """
    비디오 데이터를 Spark로 처리
    """
    try:
        spark = get_spark_session()
        
        # DataFrame 생성
        df = spark.createDataFrame(videos_data)
        
        # 기본 통계
        total_videos = df.count()
        channels = df.select("channel_id").distinct().count()
        
        # 채널별 비디오 수
        channel_stats = df.groupBy("channel_id") \
            .count() \
            .orderBy("count", ascending=False) \
            .collect()
        
        # 최신 비디오
        latest_videos = df.orderBy("published_at", ascending=False) \
            .limit(5) \
            .collect()
        
        return {
            "status": "success",
            "total_videos": total_videos,
            "unique_channels": channels,
            "channel_stats": [{"channel_id": row.channel_id, "video_count": row.count} for row in channel_stats],
            "latest_videos": [{"title": row.title, "published_at": str(row.published_at)} for row in latest_videos]
        }
    except Exception as e:
        logger.error(f"Error processing videos: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process/comments")
async def process_comments_with_spark(comments_data: List[Dict[str, Any]]):
    """
    댓글 데이터를 Spark로 처리하여 감정 분석
    """
    try:
        spark = get_spark_session()
        
        # DataFrame 생성
        df = spark.createDataFrame(comments_data)
        
        # 감정 분석 통계
        sentiment_stats = df.groupBy("sentiment_label") \
            .count() \
            .collect()
        
        # 비디오별 댓글 수
        video_comment_stats = df.groupBy("video_id") \
            .count() \
            .orderBy("count", ascending=False) \
            .limit(10) \
            .collect()
        
        # 긍정 댓글 비율
        total_comments = df.count()
        positive_comments = df.filter(df.sentiment_label == "pos").count()
        positive_ratio = positive_comments / total_comments if total_comments > 0 else 0
        
        return {
            "status": "success",
            "total_comments": total_comments,
            "sentiment_distribution": [{"label": row.sentiment_label, "count": row.count} for row in sentiment_stats],
            "top_videos_by_comments": [{"video_id": row.video_id, "comment_count": row.count} for row in video_comment_stats],
            "positive_ratio": round(positive_ratio, 3)
        }
    except Exception as e:
        logger.error(f"Error processing comments: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stream/kafka")
async def stream_kafka_with_spark(topic: str, kafka_servers: str = "kafka:29092"):
    """
    Kafka 토픽에서 데이터를 스트리밍하여 Spark로 처리
    """
    try:
        spark = get_spark_session()
        
        # Kafka에서 스트리밍
        df = spark \
            .readStream \
            .format("kafka") \
            .option("kafka.bootstrap.servers", kafka_servers) \
            .option("subscribe", topic) \
            .option("startingOffsets", "earliest") \
            .load()
        
        # 메시지 파싱 및 처리
        processed_df = df.select(
            df.key.cast("string"),
            df.value.cast("string"),
            df.topic,
            df.partition,
            df.offset
        )
        
        # 스트리밍 쿼리 시작 (백그라운드에서 실행)
        query = processed_df.writeStream \
            .outputMode("append") \
            .format("console") \
            .start()
        
        return {
            "status": "success",
            "message": f"Started streaming from topic: {topic}",
            "query_id": query.id
        }
    except Exception as e:
        logger.error(f"Error streaming from Kafka: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch/process")
async def batch_process_with_spark(
    videos_data: List[Dict[str, Any]], 
    comments_data: List[Dict[str, Any]],
    background_tasks: BackgroundTasks
):
    """
    배치 처리: 비디오와 댓글 데이터를 Spark로 대량 처리
    """
    try:
        def process_batch():
            try:
                # Spark로 데이터 처리
                result = spark_client.process_youtube_data(videos_data, comments_data)
                
                # 결과를 Kafka로 전송
                send_to_kafka(
                    topic="spark-analysis-results",
                    message=result,
                    key="batch-analysis"
                )
                
                logger.info(f"Batch processing completed: {len(videos_data)} videos, {len(comments_data)} comments")
            except Exception as e:
                logger.error(f"Error in batch processing: {e}")
        
        # 백그라운드에서 처리
        background_tasks.add_task(process_batch)
        
        return {
            "status": "accepted",
            "message": "Batch processing started in background",
            "videos_count": len(videos_data),
            "comments_count": len(comments_data)
        }
    except Exception as e:
        logger.error(f"Error starting batch processing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sql/execute")
async def execute_spark_sql(query: str):
    """
    Spark SQL 쿼리 실행
    """
    try:
        spark = get_spark_session()
        
        # SQL 쿼리 실행
        result_df = spark.sql(query)
        results = result_df.collect()
        
        # 결과를 딕셔너리로 변환
        columns = result_df.columns
        data = []
        for row in results:
            row_dict = {}
            for i, col_name in enumerate(columns):
                row_dict[col_name] = row[i]
            data.append(row_dict)
        
        return {
            "status": "success",
            "query": query,
            "columns": columns,
            "row_count": len(data),
            "data": data
        }
    except Exception as e:
        logger.error(f"Error executing SQL: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ml/sentiment")
async def ml_sentiment_analysis(text_data: List[str]):
    """
    Spark ML을 사용한 감정 분석 (간단한 예제)
    """
    try:
        spark = get_spark_session()
        
        # 텍스트 데이터를 DataFrame으로 변환
        from pyspark.sql.types import StructType, StructField, StringType
        schema = StructType([StructField("text", StringType(), True)])
        df = spark.createDataFrame([(text,) for text in text_data], schema)
        
        # 간단한 감정 분석 (실제로는 ML 모델을 사용해야 함)
        from pyspark.sql.functions import when, col, length
        
        # 텍스트 길이 기반 간단한 감정 분석
        sentiment_df = df.withColumn(
            "sentiment",
            when(length(col("text")) > 50, "positive")
            .when(length(col("text")) > 20, "neutral")
            .otherwise("negative")
        )
        
        results = sentiment_df.collect()
        
        return {
            "status": "success",
            "analysis_type": "simple_length_based",
            "results": [
                {"text": row.text, "sentiment": row.sentiment} 
                for row in results
            ]
        }
    except Exception as e:
        logger.error(f"Error in ML sentiment analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))
