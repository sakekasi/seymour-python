import semantics from "./semantics";

semantics.addOperation('id(idContext)', {
  _nonterminal(children) {
    return this.args.idContext.id(this._node);
  },

  _terminal() {
    return this.args.idContext.id(this._node);
  },
});