import json
import math

def toNetworkObject(o):
  if callable(o):
    return {'type': 'callable'}
  elif o == None:
    return {'type': 'None'}
  elif o == True:
    return {'type': 'True'}
  elif o == False:
    return {'type': 'False'}
  elif o == math.inf:
    return '∞'
  elif o == -math.inf:
    return '-∞'
  else:
    try:
      json.JSONEncoder().encode(o)
      return o
    except TypeError:
      return {'type': 'object', 'id': str(id(o))} # TODO: may wanna add object id emojis

def toNetworkString(jsonObject):
  return str(toNetworkObject(jsonObject))