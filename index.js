const fs = require('fs');
const _ = require('lodash');



const NEW_LINE_REGEX = /(\r\n|\r|\n)/;
const SIGNIFICANT_WHITESPACE = /  /g;

const TYPE_PROPERTY = 'property';
const TYPE_OBJECT = 'object';
const TYPE_ARRAY = 'array';
const TYPE_ARRAY_ELEMENT = 'array-element';

const DELIMITER_PROPERTY = '-';
const DELIMITER_OBJECT = '#';
const DELIMITER_ARRAY = '~';
const DELIMITER_ARRAY_ELEMENT = '@';

/**
 * Parses the file stored at the given path into a javscript object
 * @param {String} path The path where the .jaml file is located
 */
const parse = (path) => {
  let scope = [];

  let res = {};

  let raw = getRaw(path);

  let lines = raw.split(NEW_LINE_REGEX)
    .filter(line => line.trim() != "");
  
  let level = 0;
  let prevIndentation = 0;
  lines.forEach(line => {
    
    const indentation = getIndentation(line);
    
    line = line.trim();

    let tokens = line.split(' ').map(token => token.trim()).filter(token => token != '');    

    let first = tokens[0];
    if(isKey(first)) {
      //Pop all the way down until the indentation lines up
      while(indentation <= prevIndentation) {
        scope.pop();
        prevIndentation--;
      }
      prevIndentation = indentation;
      pushNewScope(first, scope, res);      
    } else {
      setValueAtScope(first, scope, res);
    }

    level = currentScope(scope).level;

    tokens.slice(1).forEach((token) => {
      //Check to see if it's a token
      if(isKey(token)) {
        while(currentScope(scope) && (currentScope(scope).level !== level)) {
          scope.pop();
        }
        pushNewScope(token, scope, res);
      } else {
        setValueAtScope(token, scope, res);
      }
    });

    while(currentScope(scope) && (currentScope(scope).level !== level)) {
      scope.pop();
    }
  });

  return res;
}

const getRaw = (path) => {
  return fs.readFileSync(path, 'utf8');
}

const isKey = (token) => {
  const keys = [
    DELIMITER_PROPERTY,
    DELIMITER_OBJECT,
    DELIMITER_ARRAY,
    DELIMITER_ARRAY_ELEMENT
  ]
  token = token || '';
  if(keys.includes(token.charAt(0))) return true;
  return false;
}

const getIndentation = (line) => {
  const matches = line.match(SIGNIFICANT_WHITESPACE);
  if(matches){
    return matches.length;
  }
  return 0;
}

const currentScope = (scope) => {
  return scope[scope.length - 1];
}

const pushNewScope = (token, scope, res) => {
  const firstChar = token.charAt(0);
  let _scope = currentScope(scope);
  let level = (_scope ? _scope.level || 0 : 0) + 1;
  switch(firstChar) {
    case DELIMITER_PROPERTY:
      scope.push({
        name: token.slice(1),
        type: TYPE_PROPERTY,
        level: level
      });
      setValueAtScope(true, scope, res);
      break;
    case DELIMITER_OBJECT:
      scope.push({
        name: token.slice(1),
        type: TYPE_OBJECT,
        level: level
      });
      setValueAtScope({}, scope, res);
      break;
    case DELIMITER_ARRAY:
      scope.push({
        name: token.slice(1),
        type: TYPE_ARRAY,
        level: level,
        index: 0
      });
      setValueAtScope({}, scope, res);
      break;
    case DELIMITER_ARRAY_ELEMENT:
      scope.push({
        // name: _scope ? _scope.index++ : 0,
        name: token.slice(1),
        type: TYPE_ARRAY_ELEMENT,
        level: level
      });
      setValueAtScope({name: token.slice(1)}, scope, res);
      break;
  }
}

const setValueAtScope = (val, scope, obj) => {
  const currScope = currentScope(scope);
  if(currScope && currScope.type) {
    const scopeString = getScopeString(scope);
    switch(currScope.type) {
      case TYPE_PROPERTY:
        const currVal = _.get(obj, scopeString);
        switch(typeof currVal) {
          case 'boolean':
            _.set(obj, scopeString, val);
            break;
          case 'string':
            _.set(obj, scopeString, [currVal, val]);
            break;
          case 'object':
            if(Array.isArray(currVal)) {
              _.set(obj, scopeString, [...currVal, val]);
            }
            else {
              _.set(obj, scopeString, currVal);
            }
            break;
          default:
            _.set(obj, scopeString, val);
            break;
        }
        break;
      case TYPE_OBJECT:
      case TYPE_ARRAY:
      case TYPE_ARRAY_ELEMENT:
        _.set(obj, scopeString, val);
        break;
    }
  } else {
    console.log("SHOULD THIS BE AN ERROR?!?!?");
  }
}


const getScopeString = (scope) => {
  let tmp = [];
  scope.forEach(el => {
    tmp.push(el.name);
  })
  return tmp.join('.');
}

module.exports.parse = parse;const fs = require('fs');
const _ = require('lodash');



const NEW_LINE_REGEX = /(\r\n|\r|\n)/;
const SIGNIFICANT_WHITESPACE = /  /g;

const TYPE_PROPERTY = 'property';
const TYPE_OBJECT = 'object';
const TYPE_ARRAY = 'array';
const TYPE_ARRAY_ELEMENT = 'array-element';

const DELIMITER_PROPERTY = '-';
const DELIMITER_OBJECT = '#';
const DELIMITER_ARRAY = '~';
const DELIMITER_ARRAY_ELEMENT = '@';

/**
 * Parses the file stored at the given path into a javscript object
 * @param {String} path The path where the .jaml file is located
 */
const parse = (path) => {
  let scope = [];

  let res = {};

  let raw = getRaw(path);

  let lines = raw.split(NEW_LINE_REGEX)
    .filter(line => line.trim() != "");
  
  let level = 0;
  let prevIndentation = 0;
  lines.forEach(line => {
    
    const indentation = getIndentation(line);
    
    line = line.trim();

    let tokens = line.split(' ').map(token => token.trim()).filter(token => token != '');    

    let first = tokens[0];
    if(isKey(first)) {
      //Pop all the way down until the indentation lines up
      while(indentation <= prevIndentation) {
        scope.pop();
        prevIndentation--;
      }
      prevIndentation = indentation;
      pushNewScope(first, scope, res);      
    } else {
      setValueAtScope(first, scope, res);
    }

    level = currentScope(scope).level;

    tokens.slice(1).forEach((token) => {
      //Check to see if it's a token
      if(isKey(token)) {
        while(currentScope(scope) && (currentScope(scope).level !== level)) {
          scope.pop();
        }
        pushNewScope(token, scope, res);
      } else {
        setValueAtScope(token, scope, res);
      }
    });

    while(currentScope(scope) && (currentScope(scope).level !== level)) {
      scope.pop();
    }
  });

  return res;
}

const getRaw = (path) => {
  return fs.readFileSync(path, 'utf8');
}

const isKey = (token) => {
  const keys = [
    DELIMITER_PROPERTY,
    DELIMITER_OBJECT,
    DELIMITER_ARRAY,
    DELIMITER_ARRAY_ELEMENT
  ]
  token = token || '';
  if(keys.includes(token.charAt(0))) return true;
  return false;
}

const getIndentation = (line) => {
  const matches = line.match(SIGNIFICANT_WHITESPACE);
  if(matches){
    return matches.length;
  }
  return 0;
}

const currentScope = (scope) => {
  return scope[scope.length - 1];
}

const pushNewScope = (token, scope, res) => {
  const firstChar = token.charAt(0);
  let _scope = currentScope(scope);
  let level = (_scope ? _scope.level || 0 : 0) + 1;
  switch(firstChar) {
    case DELIMITER_PROPERTY:
      scope.push({
        name: token.slice(1),
        type: TYPE_PROPERTY,
        level: level
      });
      setValueAtScope(true, scope, res);
      break;
    case DELIMITER_OBJECT:
      scope.push({
        name: token.slice(1),
        type: TYPE_OBJECT,
        level: level
      });
      setValueAtScope({}, scope, res);
      break;
    case DELIMITER_ARRAY:
      scope.push({
        name: token.slice(1),
        type: TYPE_ARRAY,
        level: level,
        index: 0
      });
      setValueAtScope({}, scope, res);
      break;
    case DELIMITER_ARRAY_ELEMENT:
      scope.push({
        // name: _scope ? _scope.index++ : 0,
        name: token.slice(1),
        type: TYPE_ARRAY_ELEMENT,
        level: level
      });
      setValueAtScope({name: token.slice(1)}, scope, res);
      break;
  }
}

const setValueAtScope = (val, scope, obj) => {
  const currScope = currentScope(scope);
  if(currScope && currScope.type) {
    const scopeString = getScopeString(scope);
    switch(currScope.type) {
      case TYPE_PROPERTY:
        const currVal = _.get(obj, scopeString);
        switch(typeof currVal) {
          case 'boolean':
            _.set(obj, scopeString, val);
            break;
          case 'string':
            _.set(obj, scopeString, [currVal, val]);
            break;
          case 'object':
            if(Array.isArray(currVal)) {
              _.set(obj, scopeString, [...currVal, val]);
            }
            else {
              _.set(obj, scopeString, currVal);
            }
            break;
          default:
            _.set(obj, scopeString, val);
            break;
        }
        break;
      case TYPE_OBJECT:
      case TYPE_ARRAY:
      case TYPE_ARRAY_ELEMENT:
        _.set(obj, scopeString, val);
        break;
    }
  } else {
    console.log("SHOULD THIS BE AN ERROR?!?!?");
  }
}


const getScopeString = (scope) => {
  let tmp = [];
  scope.forEach(el => {
    tmp.push(el.name);
  })
  return tmp.join('.');
}

module.exports.parse = parse;