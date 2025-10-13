import pymysql
conn = pymysql.connect(
    host="host.docker.internal",
    port=3307,
    user="ytuser",
    password="ytpw",
    database="yt"
)
cur = conn.cursor()
cur.execute("SHOW TABLES;")
print(cur.fetchall())
conn.close()
