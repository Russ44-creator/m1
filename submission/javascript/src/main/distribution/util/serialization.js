const { type } = require("requests");
let id = 0;
let hash_Object_to_ID = new Map();
let hash_ID_to_Object = new Map();
let forward_map = new Map();
let reverse_map = new Map();
let visited = new Set();

function build_native_func_map(root, path) {
  let propertyNames = Object.getOwnPropertyNames(root); 
  for (const key of propertyNames) {
    // console.log(key);
    if (key === 'caller' || key === 'callee' || key === 'arguments'){
      continue;
    }
    // console.log(key);
    var property = root[key];
    // console.log(property);
    // check native code
    if ((typeof property === 'function') && (property.toString().includes('[native code]'))){;
      // visited.add(property);
      path.push(key);
      let str = path.join(".");
      forward_map.set(property, str);
      reverse_map.set(str, property);
      path.pop();
      // visited.delete(property);
      continue;
    }
    if (typeof property === 'object' && property != undefined && property != null){
      if (visited.has(property) == false) {
        visited.add(property);
        path.push(key);
        build_native_func_map(property, path);
        path.pop();
      }
    }
    // visited.add(property);
  }
}

function serialize(object) {
  build_native_func_map(globalThis, []);
  console.log(forward_map);
  console.log(reverse_map.has('console.log'));
  if (typeof object == 'number') {
    return {type: 'Number', value: object.toString()};
  }

  if (typeof object == 'string') {
    return {type: 'String', value: object.toString()};
  }

  if (typeof object == 'oolean') {
    return {type: 'Boolean', value: object.toString()};
  }

  if (object === undefined) {
    return {type: 'Undefined', value: 'undefined'};
  }

  // check null
  if (object == null) { 
    return {type: 'Null', value: 'null'};
  }

  if (object instanceof Date) {
    return {type: 'Date', value: object.toISOString()};
  }

  if (object instanceof Error) {
    return {type: 'Error', message: object.message, stack: object.stack};
  }

  // check array and simple object
  if (object instanceof Array) {
    if (hash_Object_to_ID.has(object)) {
      return {type: 'Reference', u_ID: hash_Object_to_ID.get(object)};
    }
    hash_Object_to_ID.set(object, id);
    const unique_id = id;
    id ++;
    let res = [];
    for (i = 0; i < object.length; i++) {
      res.push(serialize(object[i]));
    }
    return {type: 'Array', value: res, u_ID: unique_id};
  }

  if (typeof object == 'function') {
    // if((/\{\s*\[native code\]\s*\}/).test('' + object)){
    //   return {type: 'Native Function', }
    // }
    if (forward_map.has(object)){
      return {type: 'Native Function', value: forward_map.get(object)};
    }
    return {type: 'Function', func: object.toString()};
  }

  if (object instanceof Object) {
    if (hash_Object_to_ID.has(object)) {
      return {type: 'Reference', u_ID: hash_Object_to_ID.get(object)};
    }
    hash_Object_to_ID.set(object, id);
    let res = {};
    const unique_id = id;
    id ++;
    for (var key in object) {  
      res[key] = serialize(object[key]);
    }
    return {type: 'Object', value: res, u_ID: unique_id};
  }
}

function deserialize(string) {
  parsedData = helper(string);
  return parsedData;
}

function helper(data) {
  if (data.type == 'Null'){
    return null;
  } else {
    if (data.type == 'Number') {
      return parseInt(data.value);
    }else if (data.type == 'String') {
      return data.value;
    }else if (data.type == 'Boolean') {
      return (data.value === 'true');
    }else if (data.type == 'Undefined') {
      return undefined;
    } else if (data.type == 'Array') {
      let res = [];
      hash_ID_to_Object.set(data.u_ID, res);
      res = data.value.map(item => helper(item));
      return res;
    }else if (data.type == 'Date') {
      return new Date(data.value);
    }else if (data.type == 'Error') {
      let err = new Error(data.message);
      err.stack = data.stack;
      return err;
    }else if (data.type == 'Function') {
      return new Function(`return (${data.func})`)();
    }else if (data.type == 'Native Function') {
      return reverse_map.get(data.value);
    }else if (data.type == 'Reference') {
      // return data.value;
      return hash_ID_to_Object.get(data.u_ID);
    }else if (data.type == 'Object') {
      let res = Object.create(null);
      hash_ID_to_Object.set(data.u_ID, res);
      for(var key in data.value) {
        res[key] = helper(data.value[key]);
      }
      return res;
    }
    return data.value;
  }
}

module.exports = {
  serialize: serialize,
  deserialize: deserialize
};

