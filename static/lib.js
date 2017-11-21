import $ from "jquery";

export function range(from, to) {
  const ans = [];
  for (let x = from; x <= to; x++) {
    ans.push(x);
  }
  return ans;
}

export function d(elementType, attributes, ...children) {
  const node = document.createElement(elementType);
  if (attributes == null && children.length === 0) {
    return node;
  }

  Object.keys(attributes).forEach(name => node.setAttribute(name, attributes[name]));
  for (let child of children) {
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

export function spaces(n) {
  let str = '';
  while (n-- > 0) {
    str += ' ';
  }
  return str;
}

export function flatten(arrs) {
  return [].concat.apply([], arrs);
}

export function unique(arr) {
  return Array.from(new Set(arr));
}

export function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export function fetchGist(id) {
  return $.ajax(`https://api.github.com/gists/${id}`);
}