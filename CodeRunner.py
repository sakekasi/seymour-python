import gipc
import sys
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
      print('CAUGHT TERMINATEEXCEPTION')
      sys.exit(1)
      print('EXITED')
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
    print('GRACEFUL EXIT')
    self.R.terminate = True
    sys.exit(1)

  def start(self):
    # self.childEnd.put('test')
    # print('AFTERTEST')
    self.process = gipc.start_process(target=self.run_program, args=(self.writeEnd,), daemon=True)
  
  def terminate(self):
    self.process.terminate()
  
  def join(self):
    print("JOINING")
    self.process.join()
    self.readEnd.close()
    try:
      self.writeEnd.close()
    except gipc.gipc.GIPCClosed:
      pass