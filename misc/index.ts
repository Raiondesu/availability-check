import { Route } from '../types';

/**
 * fromPath
 * Returns a value from an object by a given path (usually string).
 *
 * @param obj an object to get a value from.
 * @param path to get a value by.
 * @param splitter to split the path by. Default is '.' ('obj.path.example')
 * @returns a value from a given path. If a path is invalid - returns undefined.
 */
export function fromPath(obj, path, splitter = '.') {
  if (!path)
    return obj;

  if (typeof path === 'number' || !~path.indexOf(splitter))
    return obj[path];

  return path.split(splitter).reduce((o, i) => (o === Object(o) ? o[i] : o), obj);
}

export function route(handler: Route.Handler, children?: Route.Tree) {
  if (children) {
    for (const route in children) {
      handler[route] = children[route];
    }
  }

  return handler;
}
