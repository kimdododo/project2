import os
import logging
from typing import Optional, Dict, Any, List
from pyspark.sql import SparkSession, DataFrame
from pyspark.sql.functions import col, count, avg, max, min, sum as spark_sum, when, regexp_replace
from pyspark.sql.types import StructType, StructField, StringType, IntegerType, FloatType, TimestampType
import findspark

logger = logging.getLogger(__name__)

class SparkClient:
    def __init__(self):
        self.spark = None
        self.spark_master = os.getenv('SPARK_MASTER', 'spark://spark-master:7077')
        self.app_name = os.getenv('SPARK_APP_NAME', 'youtube-analytics')
        
    def get_spark_session(self) -> SparkSession:
        """Get or create Spark session"""
        if self.spark is None:
            try:
                # Find Spark installation
                findspark.init()
                
                self.spark = SparkSession.builder \
                    .appName(self.app_name) \
                    .master(self.spark_master) \
                    .config("spark.sql.adaptive.enabled", "true") \
                    .config("spark.sql.adaptive.coalescePartitions.enabled", "true") \
                    .config("spark.serializer", "org.apache.spark.serializer.KryoSerializer") \
                    .config("spark.sql.execution.arrow.pyspark.enabled", "true") \
                    .getOrCreate()
                
                logger.info(f"Spark session created with master: {self.spark_master}")
            except Exception as e:
                logger.error(f"Failed to create Spark session: {e}")
                raise
        return self.spark
    
    def create_dataframe_from_dict(self, data: List[Dict[str, Any]], schema: Optional[StructType] = None) -> DataFrame:
        """Create DataFrame from list of dictionaries"""
        spark = self.get_spark_session()
        
        if schema is None:
            # Auto-detect schema from first record
            if data:
                first_record = data[0]
                fields = []
                for key, value in first_record.items():
                    if isinstance(value, int):
                        fields.append(StructField(key, IntegerType(), True))
                    elif isinstance(value, float):
                        fields.append(StructField(key, FloatType(), True))
                    else:
                        fields.append(StructField(key, StringType(), True))
                schema = StructType(fields)
        
        return spark.createDataFrame(data, schema)
    
    def analyze_video_sentiment(self, comments_df: DataFrame) -> Dict[str, Any]:
        """Analyze video sentiment from comments"""
        spark = self.get_spark_session()
        
        # Assuming comments_df has columns: video_id, text, sentiment_label, sentiment_score
        sentiment_analysis = comments_df.groupBy("video_id") \
            .agg(
                count("text").alias("total_comments"),
                count(when(col("sentiment_label") == "pos", 1)).alias("positive_comments"),
                count(when(col("sentiment_label") == "neg", 1)).alias("negative_comments"),
                count(when(col("sentiment_label") == "neu", 1)).alias("neutral_comments"),
                avg("sentiment_score").alias("avg_sentiment_score")
            ) \
            .withColumn("positive_ratio", col("positive_comments") / col("total_comments")) \
            .withColumn("negative_ratio", col("negative_comments") / col("total_comments")) \
            .withColumn("neutral_ratio", col("neutral_comments") / col("total_comments"))
        
        return sentiment_analysis.collect()
    
    def analyze_topic_trends(self, topics_df: DataFrame) -> Dict[str, Any]:
        """Analyze topic trends from video topics"""
        spark = self.get_spark_session()
        
        # Assuming topics_df has columns: video_id, topic_label, probability, published_at
        topic_trends = topics_df.groupBy("topic_label") \
            .agg(
                count("video_id").alias("video_count"),
                avg("probability").alias("avg_probability"),
                max("published_at").alias("latest_video")
            ) \
            .orderBy(col("video_count").desc())
        
        return topic_trends.collect()
    
    def process_youtube_data(self, videos_data: List[Dict[str, Any]], comments_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Process YouTube data with Spark"""
        spark = self.get_spark_session()
        
        # Create DataFrames
        videos_df = self.create_dataframe_from_dict(videos_data)
        comments_df = self.create_dataframe_from_dict(comments_data)
        
        # Basic analytics
        total_videos = videos_df.count()
        total_comments = comments_df.count()
        
        # Channel analysis
        channel_stats = videos_df.groupBy("channel_id") \
            .agg(
                count("video_id").alias("video_count"),
                avg("view_count").alias("avg_views"),
                max("published_at").alias("latest_video")
            ) \
            .orderBy(col("video_count").desc())
        
        # Sentiment analysis
        sentiment_results = self.analyze_video_sentiment(comments_df)
        
        # Topic analysis
        if "topics" in comments_df.columns:
            topic_results = self.analyze_topic_trends(comments_df)
        else:
            topic_results = []
        
        return {
            "total_videos": total_videos,
            "total_comments": total_comments,
            "channel_stats": channel_stats.collect(),
            "sentiment_analysis": sentiment_results,
            "topic_analysis": topic_results
        }
    
    def stream_kafka_data(self, topic: str, kafka_servers: str = "kafka:29092") -> DataFrame:
        """Stream data from Kafka topic"""
        spark = self.get_spark_session()
        
        df = spark \
            .readStream \
            .format("kafka") \
            .option("kafka.bootstrap.servers", kafka_servers) \
            .option("subscribe", topic) \
            .option("startingOffsets", "earliest") \
            .load()
        
        return df.select(
            col("key").cast("string"),
            col("value").cast("string"),
            col("topic"),
            col("partition"),
            col("offset"),
            col("timestamp")
        )
    
    def write_to_kafka(self, df: DataFrame, topic: str, kafka_servers: str = "kafka:29092"):
        """Write DataFrame to Kafka topic"""
        df.selectExpr("CAST(key AS STRING)", "CAST(value AS STRING)") \
            .writeStream \
            .format("kafka") \
            .option("kafka.bootstrap.servers", kafka_servers) \
            .option("topic", topic) \
            .option("checkpointLocation", "/tmp/checkpoint") \
            .start()
    
    def close(self):
        """Close Spark session"""
        if self.spark:
            self.spark.stop()
            self.spark = None
            logger.info("Spark session closed")

# Global Spark client instance
spark_client = SparkClient()

# Convenience functions
def get_spark_session() -> SparkSession:
    """Get Spark session"""
    return spark_client.get_spark_session()

def process_data_with_spark(data: List[Dict[str, Any]], processing_type: str = "basic") -> Dict[str, Any]:
    """Process data with Spark"""
    if processing_type == "youtube":
        return spark_client.process_youtube_data(data, [])
    else:
        df = spark_client.create_dataframe_from_dict(data)
        return {"count": df.count(), "columns": df.columns}
