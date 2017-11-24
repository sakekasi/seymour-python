import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from datetime import datetime
from urllib.parse import quote
import json

from config import *

session = boto3.session.Session()
client = session.client('s3',
                        region_name=S3_REGION,
                        endpoint_url=S3_LOCATION,
                        aws_access_key_id=S3_KEY,
                        aws_secret_access_key=S3_SECRET)

def uploadScreenshot(ip, image, message, positive):
  client.put_object(
    Bucket=S3_BUCKET,
    Key='screenshots/' + ip + '/' + str(datetime.now()),
    Body=encodeScreenshot(ip, image, message, positive),
    ContentType='application/json',
    ACL='public-read'
  )

def encodeScreenshot(ip, image, message, positive):
  jsonStr = json.dumps({'ip': ip, 'image': image, 'message': message, 'positive': positive})
  return jsonStr.encode('utf-8')