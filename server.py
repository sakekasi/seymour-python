#!/usr/bin/env python

import json
import dill
import os
import gevent
from flask import Flask, render_template
from flask_sockets import Sockets
# from multiprocessing import Queue
# from queue import Empty

from CodeRunner import CodeRunner
from utils import toJSON

app = Flask(__name__)
app.debug = 'DEBUG' in os.environ
sockets = Sockets(app)

class CodeRunnerBackend(object):
  def __init__(self):
    self.websockets = []
    self.codeRunners = {}
  
  def start(self):
    gevent.spawn(self.run)

  def run(self):
    while True:
      gevent.sleep()
      for websocket in self.websockets:
        codeRunner = self.codeRunners[websocket]
        try:
          item = codeRunner.readEnd.get()
        except EOFError:
          continue
        # item = dill.loads(item)
        # print(codeRunner.process.pid, item)
        websocket.send(toJSON(item))
        if item['type'] == 'done':
          print('DONE')
          codeRunner.join()
          self._clear(websocket)
  
  def register(self, websocket, codeRunner):
    self.websockets.append(websocket)
    self.codeRunners[websocket] = codeRunner
  
  def stop(self, websocket):
    print('STOP')
    try:
      codeRunner = self.codeRunners[websocket]
      self.codeRunners[websocket].terminate()
      self.codeRunners[websocket].join()
      self._clear(websocket)
    except KeyError:
      pass
  
  def _clear(self, websocket):
    self.websockets.remove(websocket)
    del self.codeRunners[websocket]

codeRunnerBackend = CodeRunnerBackend()
codeRunnerBackend.start()

@app.route('/')
def index():
  return render_template('index.html')

@sockets.route('/run')
def onConnection(websocket):
  codeRunner = None
  while not websocket.closed:
    gevent.sleep()
    message = websocket.receive()
    if (message == None):
      continue
    message = json.loads(message)

    print(message['type'])
    if message['type'] == 'run':
      codeRunner = CodeRunner(message['code'], message['sourceLocs'])
      print('start')
      codeRunner.start()
      codeRunnerBackend.register(websocket, codeRunner)
    
    elif message['type'] == 'kill':
      codeRunnerBackend.stop(websocket)
        
    else:
      raise ValueError('unknown message type {}'.format(message['type']))
  print('WEBSOCKET CLOSED')
  codeRunnerBackend.stop(websocket)


