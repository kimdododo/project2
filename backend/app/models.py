from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Integer, BigInteger, Text, DateTime, Float, Index
from datetime import datetime

class Base(DeclarativeBase): pass

class Query(Base):
    __tablename__ = "queries"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    keyword: Mapped[str] = mapped_column(String(200), index=True)
    status: Mapped[str | None] = mapped_column(String(32), nullable=True)
    videos: Mapped[int | None] = mapped_column(Integer, nullable=True)
    comments: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime | None] = mapped_column(DateTime, default=datetime.utcnow)

class Video(Base):
    __tablename__ = "videos"
    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    channel_id: Mapped[str] = mapped_column(String(64), nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

class VideoStats(Base):
    __tablename__ = "video_stats"
    video_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    view_count: Mapped[int | None] = mapped_column(BigInteger, nullable=True)

class Comment(Base):
    __tablename__ = "comments"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    video_id: Mapped[str] = mapped_column(String(32), nullable=False)
    author: Mapped[str | None] = mapped_column(String(200), nullable=True)
    text: Mapped[str | None] = mapped_column(Text, nullable=True)

class Recommendation(Base):
    __tablename__ = "recs"
    video_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    similar_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    __table_args__ = (
        Index('ix_recs_video_id', 'video_id'),
        Index('ix_recs_similar_id', 'similar_id'),
    )

class Topic(Base):
    __tablename__ = "topics"
    video_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    topic_id: Mapped[int] = mapped_column(Integer, nullable=False)
    topic_label: Mapped[str] = mapped_column(String(255), nullable=False)
    probability: Mapped[float] = mapped_column(Float, nullable=False)

class CommentSentiment(Base):
    __tablename__ = "comment_sentiment"
    comment_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    video_id: Mapped[str] = mapped_column(String(64), nullable=False)
    label: Mapped[str] = mapped_column(String(32), nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    __table_args__ = (
        Index('ix_comment_sentiment_video_id', 'video_id'),
    )

class VideoSentimentAgg(Base):
    __tablename__ = "video_sentiment_agg"
    video_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    pos: Mapped[float] = mapped_column(Float, nullable=False)
    neu: Mapped[float] = mapped_column(Float, nullable=False)
    neg: Mapped[float] = mapped_column(Float, nullable=False)
    n: Mapped[int] = mapped_column(Integer, nullable=False)