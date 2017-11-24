import base64
from s3 import client
import json
from config import S3_BUCKET

def writePng(key, outfile):
  ans = client.get_object(Bucket=S3_BUCKET, Key=key)
  bodyStr = ans['Body'].read()
  data = json.loads(bodyStr)
  imgstr = data['image'][len('data:image/png;base64,'):]
  with open(outfile, 'wb') as fh:
    fh.write(base64.b64decode(imgstr))