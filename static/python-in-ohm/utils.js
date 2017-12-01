export function flatten(arrs) {
  return [].concat.apply([], arrs);
}

export function range(from, to, step = 1) {
  const ans = [];
  for (let x = from; x <= to; x+=step) {
    ans.push(x);
  }
  return ans;
}

export function last(arr) {
  return arr[arr.length - 1];
}

export function repeat(str, n) {
  let ans = '';
  range(1, n).forEach(() => ans += str);
  return ans;
}

export function spaces(n) {
  return repeat(' ', n);
}

export function trimRight(str) {
	var tail = str.length;

	while (/[\s\uFEFF\u00A0]/.test(str[tail - 1])) {
		tail--;
	}

	return str.slice(0, tail);
}

export class ParseError extends Error {
  constructor(idx, expected, ...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }

    this.idx = idx;
    this.expected = expected;
    this.isParseError = true;
    this.message = `^\nExpected: ${this.expected}`
  }
}

export class IndentationError extends Error {
  constructor(idx, ...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, IndentationError);
    }

    this.idx = idx;
    this.message = '^\nindentation error'
  }
}

export class ParensError extends Error {
  constructor(idx, ...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ParensError);
    }

    this.idx = idx;
  }
}