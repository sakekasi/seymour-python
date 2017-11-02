from multiprocessing import Queue, Process
import signal

from EventRecorder import EventRecorder, TerminateException

class CodeRunner(object):
  def __init__(self, code, sourceLocs):
    self.code = code
    self.sourceLocs = sourceLocs

    self.queue = Queue()
    self.process = Process(target=self.run_program)
    self.R = None
  
  def run_program(self):
    signal.signal(signal.SIGTERM, self._exit_gracefully)
    
    g = globals().copy()
    self.R = R = EventRecorder(self.queue)
    g['sls'] = self.sourceLocs
    g['R'] = R
    
    exec(self.code, g)
    
    try:
      g['runCode']()
    except TerminateException as te:
      pass
    except Exception as e:
      if not R.raised:
        activationEnv = R.currentProgramOrSendEvent.activationEnv
        R.error(
          R.currentProgramOrSendEvent.sourceLoc if activationEnv != None else None,
          activationEnv if activationEnv != None else R.currentProgramOrSendEvent.env,
          str(e)
        )
  
  def _exit_gracefully(self, arg1, arg2):
    self.R.terminate = True

  def start(self):
    self.process.start()
  
  def terminate(self):
    self.process.terminate()
  
  async def join(self):
    return self.process.coro_join()