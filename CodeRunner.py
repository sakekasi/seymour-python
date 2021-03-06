import gipc
import sys
import traceback
# from multiprocessing import Queue, Process
import signal

from EventRecorder import EventRecorder, TerminateException

class CodeRunner(object):
  def __init__(self, code, sourceLocs):
    self.code = code
    self.sourceLocs = sourceLocs

    (self.readEnd, self.writeEnd) = gipc.pipe()
    self.process = None
    self.R = None
  
  def run_program(self, handle):
    signal.signal(signal.SIGTERM, self._exit_gracefully)
    
    g = globals().copy()
    self.R = R = EventRecorder(handle)
    g['sls'] = self.sourceLocs
    g['R'] = R
    
    exec(self.code, g)
    
    try:
      g['runCode']()
    except TerminateException as te:
      sys.exit(1)
      pass
    except Exception as e:
      if not R.raised:
        traceback.print_exc()
        activationEnv = R.currentProgramOrSendEvent.activationEnv
        R.error(
          R.currentProgramOrSendEvent.sourceLoc if activationEnv != None else None,
          activationEnv if activationEnv != None else R.currentProgramOrSendEvent.env,
          str(e)
        )
  
  def _exit_gracefully(self, arg1, arg2):
    self.R.terminate = True
    sys.exit(1)

  def start(self):
    self.process = gipc.start_process(target=self.run_program, args=(self.writeEnd,), daemon=True)
  
  def terminate(self):
    self.process.terminate()
  
  def join(self):
    self.process.join()
    self.readEnd.close()
    try:
      self.writeEnd.close()
    except gipc.gipc.GIPCClosed:
      pass