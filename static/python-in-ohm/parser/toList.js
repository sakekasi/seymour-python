import {Arguments} from "./ast";
import {list} from "./easyAst";

Arguments.prototype.toList = function() {
  if (this.vararg !== null) {
    return list([...this.args, this.vararg]);
  } else {
    return list(this.args);
  }
};