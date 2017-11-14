#!/usr/bin/env python

import json
import dill
import os
import gevent
import logging
import sys
from flask import Flask, render_template
from flask_sockets import Sockets
# from multiprocessing import Queue
# from queue import Empty

from CodeRunner import CodeRunner

app = Flask(__name__)
app.logger.addHandler(logging.StreamHandler(sys.stdout))
app.debug = 'DEBUG' in os.environ
app.logger.setLevel(logging.DEBUG if app.debug else logging.INFO)
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
        websocket.send(json.dumps(item))
        if item['type'] == 'done':
          app.logger.debug('JOINING CODERUNNER')
          codeRunner.join()
          self._clear(websocket)
  
  def register(self, websocket, codeRunner):
    self.websockets.append(websocket)
    self.codeRunners[websocket] = codeRunner
  
  def stop(self, websocket):
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
  app.logger.info('NEW WEBSOCKET CONNECTION')
  while not websocket.closed:
    gevent.sleep()
    message = websocket.receive()
    if (message == None):
      continue
    message = json.loads(message)

    app.logger.info('WEBSOCKET MESSAGE %s', message['type'])
    if message['type'] == 'run':
      codeRunner = CodeRunner(message['code'], message['sourceLocs'])
      app.logger.debug('STARTING CODERUNNER')
      codeRunner.start()
      codeRunnerBackend.register(websocket, codeRunner)
      app.logger.debug('STARTED CODERUNNER')
    
    elif message['type'] == 'kill':
      app.logger.debug('STOPPING CODERUNNER')
      codeRunnerBackend.stop(websocket)
      app.logger.debug('STOPPED CODERUNNER')
        
    else:
      raise ValueError('unknown message type {}'.format(message['type']))
  app.logger.info('WEBSOCKET CONNECTION CLOSED')
  codeRunnerBackend.stop(websocket)


