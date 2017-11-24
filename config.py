import os

S3_REGION = os.environ.get("S3_REGION_NAME")
S3_BUCKET = os.environ.get("S3_BUCKET_NAME")
S3_KEY = os.environ.get("S3_ACCESS_KEY")
S3_SECRET = os.environ.get("S3_SECRET_ACCESS_KEY")
S3_LOCATION = 'https://nyc3.digitaloceanspaces.com'