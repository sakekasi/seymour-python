class Event {
  constructor(orderNum, sourceLoc, env) {
    this.orderNum = orderNum;
    this.id = Event.nextEventId++;
    this.sourceLoc = sourceLoc;
    this.env = env;
    this.children = [];
  }

  toMicroVizString() {
    throw new Error('abstract method!');
  }

  _valueString(v) {
    if (typeof v === 'function') {
      return '{function}';
    } else if (v === undefined) {
      return 'undefined';
    } else if (v === Infinity) {
      return '∞';
    } else if (v === -Infinity) {
      return '-∞';
    } else if (v !== null && v.type === 'callable') {
      return '{callable}';
    } else if (v !== null && v.type === 'False') {
      return 'False';
    } else if (v !== null && v.type === 'True') {
      return 'True';
    } else if (v !== null && v.type === 'None') {
      return 'None';
    } else if (v !== null && v.hasOwnProperty('id')) {
      return v.id < Event.objectIdEmojis.length ? Event.objectIdEmojis[v.id] : '#' + v.id;
    } else {
      return JSON.stringify(v);
    }
  }

  subsumes(that) {
    return false;
  }
}

Event.nextEventId = 0;

Event.objectIdEmojis = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧',
  '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🕷',
  '🐢', '🐍', '🦎', '🦂', '🦀', '🦑', '🐙', '🦐', '🐠', '🐟', '🐡', '🐬', '🦈', '🐳', '🐋', '🐊', '🐆',
  '🐅', '🐃', '🐂', '🐄', '🦌', '🐪', '🐫', '🐘', '🦏', '🦍', '🐎', '🐖', '🐐', '🐏', '🐑', '🐕', '🐩',
  '🐈', '🐓', '🦃', '🕊', '🐇', '🐁', '🐀', '🐿', '🐉', '🐲', '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉',
  '🍇', '🍓', '🍈', '🍒', '🍑', '🍍', '🥝', '🥑', '🍅', '🍆', '🥒', '🥕', '🌽', '🌶', '🥔', '🍠', '🌰',
  '🥜', '🍯', '🥐', '🍞', '🥖', '🧀', '🥚', '🍳', '🥓', '🥞', '🍤', '🍗', '🍖', '🍕', '🌭', '🍔', '🍟',
  '🥙', '🌮', '🌯', '🍝', '🍜', '🍲', '🍣', '🍱', '🍦', '🍧', '🍨', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫',
  '🍿', '🍩', '🍪', '🥛', '🍼', '☕️', '🍵', '🍶', '🍺', '🍷', '🥃', '🍸', '🍹', '⚽️', '🏀', '🏈', '⚾️',
  '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '⛸', '🏄', '🎸', '🎷', '🏠', '🏰', '😀', '😱', '👦🏻', '👨🏾'];

export class ProgramEvent extends Event {
  constructor(orderNum, sourceLoc) {
    super(orderNum, sourceLoc, null);
    // also: activationEnv
  }
}

export class SendEvent extends Event {
  constructor(orderNum, sourceLoc, env, recv, selector, args, activationPathToken) {
    super(orderNum, sourceLoc, env);
    this.recv = recv;
    this.selector = selector;
    this.args = args;
    this.activationPathToken = activationPathToken;
    // also: activationEnv, returnValue
  }

  toDetailString() {
    let s =
        'receiver: ' + this._valueString(this.recv) + '\n' +
        'selector: ' + this.selector + '\n' +
        'arguments: [' + this.args.map(x => this._valueString(x)).join(', ') + ']\n';
    if (this.hasOwnProperty('returnValue')) {
      s += '⇒ ' + this._valueString(this.returnValue);
    }
    return s;
  }

  isInlineBlockCall() {
    const isBlockCall = this.selector === 'enterNewScope';
    if (!isBlockCall) return false;

    let someParentContains = false;
    let env = this.env;
    while (env) {
      const send = env.programOrSendEvent;
      someParentContains = someParentContains || 
        (send.sourceLoc && send.sourceLoc.contains(this.activationEnv.sourceLoc));
      env = env.callerEnv;
    }
    return isBlockCall && someParentContains;
  }
}

export class VarDeclEvent extends Event {
  constructor(orderNum, sourceLoc, env, name, value) {
    super(orderNum, sourceLoc, env);
    this.name = name;
    this.value = value;
  }

  toMicroVizString() {
    return this.name + ' = ' + this._valueString(this.value);
  }
}

export class VarAssignmentEvent extends Event {
  constructor(orderNum, sourceLoc, env, declEnv, name, value) {
    super(orderNum, sourceLoc, env);
    this.declEnv = declEnv;
    this.name = name;
    this.value = value;
  }

  subsumes(that) {
    return (that instanceof VarAssignmentEvent || that instanceof VarDeclEvent) &&
        this.name === that.name && this.declEnv === that.declEnv;
  }

  toMicroVizString() {
    return this.name + ' = ' + this._valueString(this.value);
  }
}

export class InstVarAssignmentEvent extends Event {
  constructor(orderNum, sourceLoc, env, obj, name, value) {
    super(orderNum, sourceLoc, env);
    this.obj = obj;
    this.name = name;
    this.value = value;
  }

  subsumes(that) {
    return that instanceof InstVarAssignmentEvent &&
        this.receiver === that.receiver && this.name === that.name;
  }

  toMicroVizString() {
    return this._valueString(this.obj) + '.' + this.name + ' = ' + this._valueString(this.value);
  }
}

export class InstantiationEvent extends Event {
  // TODO: how should we handle the call to init?
  constructor(orderNum, sourceLoc, env, _class, args, newInstance) {
    super(orderNum, sourceLoc, env);
    this.class = _class;
    this.args = args;
    this.newInstance = newInstance;
  }

  toMicroVizString() {
    return 'new ' + this._valueString(this.class) + ' → ' + this._valueString(this.newInstance);
  }
}

export class ReturnEvent extends Event {
  constructor(orderNum, sourceLoc, env, value) {
    super(orderNum, sourceLoc, env);
    this.value = value;
  }

  toMicroVizString() {
    throw new Error('abstract method');
  }
}

export class LocalReturnEvent extends ReturnEvent {
  toMicroVizString() {
    return '→ ' + this._valueString(this.value);
  }
}

export class NonLocalReturnEvent extends ReturnEvent {
  toMicroVizString() {
    return 'return ' + this._valueString(this.value);
  }
}

export class ShowEvent extends Event {
  constructor(orderNum, sourceLoc, env, string) {
    super(orderNum, sourceLoc, env);
    this.string = string;
  }

  toMicroVizString() { return this.string; }
}

export class ErrorEvent extends Event {
  constructor(sourceLoc, env, errorString) {
    super(-1, sourceLoc, env);
    this.errorString = errorString;
  }

  toMicroVizString() { return '▨'; }
}
