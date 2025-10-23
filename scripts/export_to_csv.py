#!/usr/bin/env python3
"""
MySQL 데이터를 CSV로 내보내는 스크립트
다양한 테이블의 데이터를 CSV 파일로 다운로드
"""

import os
import sys
import pandas as pd
import pymysql
from datetime import datetime
import argparse

# 데이터베이스 연결 설정
MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
MYSQL_PORT = int(os.getenv('MYSQL_PORT', '3307'))
MYSQL_DB = os.getenv('MYSQL_DB', 'yt')
MYSQL_USER = os.getenv('MYSQL_USER', 'ytuser')
MYSQL_PW = os.getenv('MYSQL_PW', 'ytpw')

def get_connection():
    """MySQL 연결"""
    return pymysql.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PW,
        database=MYSQL_DB,
        charset='utf8mb4'
    )

def export_table_to_csv(table_name: str, output_dir: str = "exports", limit: int = None):
    """테이블을 CSV로 내보내기"""
    try:
        conn = get_connection()
        
        # LIMIT 절 추가
        limit_clause = f"LIMIT {limit}" if limit else ""
        
        # 데이터 조회
        query = f"SELECT * FROM {table_name} {limit_clause}"
        df = pd.read_sql(query, conn)
        
        # 출력 디렉토리 생성
        os.makedirs(output_dir, exist_ok=True)
        
        # CSV 파일명 생성
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{table_name}_{timestamp}.csv"
        filepath = os.path.join(output_dir, filename)
        
        # CSV 저장
        df.to_csv(filepath, index=False, encoding='utf-8-sig')
        
        print(f"[SUCCESS] {table_name}: {len(df)} rows exported to {filepath}")
        return filepath
        
    except Exception as e:
        print(f"[ERROR] Error exporting {table_name}: {e}")
        return None
    finally:
        if 'conn' in locals():
            conn.close()

def export_custom_query_to_csv(query: str, filename: str, output_dir: str = "exports"):
    """커스텀 쿼리 결과를 CSV로 내보내기"""
    try:
        conn = get_connection()
        
        # 데이터 조회
        df = pd.read_sql(query, conn)
        
        # 출력 디렉토리 생성
        os.makedirs(output_dir, exist_ok=True)
        
        # CSV 파일명 생성
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        csv_filename = f"{filename}_{timestamp}.csv"
        filepath = os.path.join(output_dir, csv_filename)
        
        # CSV 저장
        df.to_csv(filepath, index=False, encoding='utf-8-sig')
        
        print(f"[SUCCESS] Custom query: {len(df)} rows exported to {filepath}")
        return filepath
        
    except Exception as e:
        print(f"[ERROR] Error exporting custom query: {e}")
        return None
    finally:
        if 'conn' in locals():
            conn.close()

def export_all_tables(output_dir: str = "exports", limit: int = None):
    """모든 테이블을 CSV로 내보내기"""
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # 테이블 목록 조회
        cur.execute("SHOW TABLES")
        tables = [table[0] for table in cur.fetchall()]
        
        print(f"[INFO] Found {len(tables)} tables to export")
        print("=" * 50)
        
        exported_files = []
        
        for table in tables:
            filepath = export_table_to_csv(table, output_dir, limit)
            if filepath:
                exported_files.append(filepath)
        
        print("=" * 50)
        print(f"[SUCCESS] Exported {len(exported_files)} tables to {output_dir}/")
        return exported_files
        
    except Exception as e:
        print(f"[ERROR] Error exporting all tables: {e}")
        return []
    finally:
        if 'conn' in locals():
            conn.close()

def export_analytics_data(output_dir: str = "exports"):
    """분석용 데이터 내보내기"""
    analytics_queries = {
        "video_analytics": """
            SELECT 
                v.id,
                v.title,
                v.channel_id,
                c.title as channel_name,
                v.view_count,
                v.like_count,
                v.comment_count,
                v.published_at,
                vsa.avg_sentiment_score,
                vsa.sentiment_ratio,
                vsa.positive_count,
                vsa.negative_count,
                vsa.neutral_count
            FROM videos v
            LEFT JOIN channels c ON v.channel_id = c.id
            LEFT JOIN video_sentiment_agg vsa ON v.id = vsa.video_id
            ORDER BY v.view_count DESC
        """,
        
        "channel_analytics": """
            SELECT 
                c.id,
                c.title,
                c.subscriber_count,
                c.view_count,
                c.video_count,
                cg.growth_rate,
                cg.recorded_at as last_growth_record
            FROM channels c
            LEFT JOIN (
                SELECT channel_id, growth_rate, recorded_at
                FROM channel_growth 
                WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                ORDER BY recorded_at DESC 
                LIMIT 1
            ) cg ON c.id = cg.channel_id
            ORDER BY c.subscriber_count DESC
        """,
        
        "sentiment_analysis": """
            SELECT 
                sa.video_id,
                v.title,
                sa.sentiment_label,
                sa.sentiment_score,
                sa.confidence,
                sa.emotion_tags,
                sa.analyzed_at
            FROM sentiment_analysis sa
            LEFT JOIN videos v ON sa.video_id = v.id
            ORDER BY sa.analyzed_at DESC
        """,
        
        "recommendations": """
            SELECT 
                r.user_id,
                r.video_id,
                v.title,
                v.channel_id,
                c.title as channel_name,
                r.recommendation_type,
                r.score,
                r.reason,
                r.created_at
            FROM recommendations r
            LEFT JOIN videos v ON r.video_id = v.id
            LEFT JOIN channels c ON v.channel_id = c.id
            WHERE r.is_active = TRUE
            ORDER BY r.score DESC
        """,
        
        "trending_topics": """
            SELECT 
                topic,
                topic_score,
                related_keywords,
                video_count,
                total_views,
                trend_period,
                recorded_at
            FROM trending_topics
            ORDER BY topic_score DESC
        """
    }
    
    print("[INFO] Exporting analytics data...")
    print("=" * 50)
    
    exported_files = []
    
    for query_name, query in analytics_queries.items():
        filepath = export_custom_query_to_csv(query, query_name, output_dir)
        if filepath:
            exported_files.append(filepath)
    
    print("=" * 50)
    print(f"[SUCCESS] Exported {len(exported_files)} analytics datasets")
    return exported_files

def export_user_behavior(output_dir: str = "exports", days: int = 30):
    """사용자 행동 데이터 내보내기"""
    try:
        conn = get_connection()
        
        query = f"""
            SELECT 
                ubl.user_id,
                ubl.video_id,
                v.title,
                v.channel_id,
                c.title as channel_name,
                ubl.action_type,
                ubl.action_data,
                ubl.session_id,
                ubl.created_at
            FROM user_behavior_logs ubl
            LEFT JOIN videos v ON ubl.video_id = v.id
            LEFT JOIN channels c ON v.channel_id = c.id
            WHERE ubl.created_at >= DATE_SUB(NOW(), INTERVAL {days} DAY)
            ORDER BY ubl.created_at DESC
        """
        
        filepath = export_custom_query_to_csv(query, f"user_behavior_{days}days", output_dir)
        return filepath
        
    except Exception as e:
        print(f"[ERROR] Error exporting user behavior: {e}")
        return None

def main():
    """메인 함수"""
    parser = argparse.ArgumentParser(description="Export MySQL data to CSV")
    parser.add_argument("--table", help="Export specific table")
    parser.add_argument("--all", action="store_true", help="Export all tables")
    parser.add_argument("--analytics", action="store_true", help="Export analytics data")
    parser.add_argument("--behavior", action="store_true", help="Export user behavior data")
    parser.add_argument("--output-dir", default="exports", help="Output directory")
    parser.add_argument("--limit", type=int, help="Limit number of rows")
    parser.add_argument("--days", type=int, default=30, help="Days for behavior data")
    
    args = parser.parse_args()
    
    print("YouTube Analytics - CSV Export Tool")
    print("=" * 60)
    
    # 출력 디렉토리 생성
    os.makedirs(args.output_dir, exist_ok=True)
    
    exported_files = []
    
    if args.table:
        # 특정 테이블 내보내기
        filepath = export_table_to_csv(args.table, args.output_dir, args.limit)
        if filepath:
            exported_files.append(filepath)
    
    elif args.all:
        # 모든 테이블 내보내기
        exported_files.extend(export_all_tables(args.output_dir, args.limit))
    
    elif args.analytics:
        # 분석 데이터 내보내기
        exported_files.extend(export_analytics_data(args.output_dir))
    
    elif args.behavior:
        # 사용자 행동 데이터 내보내기
        filepath = export_user_behavior(args.output_dir, args.days)
        if filepath:
            exported_files.append(filepath)
    
    else:
        # 기본: 주요 테이블들 내보내기
        main_tables = ['videos', 'channels', 'comments', 'sentiment_analysis', 'recommendations']
        for table in main_tables:
            filepath = export_table_to_csv(table, args.output_dir, args.limit)
            if filepath:
                exported_files.append(filepath)
    
    print("\n" + "=" * 60)
    print(f"[INFO] Exported files saved to: {os.path.abspath(args.output_dir)}")
    print(f"[INFO] Total files: {len(exported_files)}")
    
    if exported_files:
        print("\n[INFO] Exported files:")
        for filepath in exported_files:
            file_size = os.path.getsize(filepath) / 1024  # KB
            print(f"  - {os.path.basename(filepath)} ({file_size:.1f} KB)")

if __name__ == "__main__":
    main()
