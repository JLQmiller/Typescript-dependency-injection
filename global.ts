export namespace InjectMeta {
  export type TargetType = 'Injector' | 'Injectable';

  export function getProperties(target: Object): {[key: string]: Object} {
    return Reflect.getMetadata('inject:target:properties', target) || {};
  }

  export function addProperty(target: Object, propertyKey: string, property: Object) {
    const properties = getProperties(target);
    properties[propertyKey] = property;
    setProperties(target, properties);
  }

  export function setProperties(target: Object, properties: {[key: string]: Object}) {
    Reflect.defineMetadata('inject:target:properties', properties, target);
  }

  export function setConstructorParams(target: Object, params: Object[]) {
    Reflect.defineMetadata('inject:target:constructor', params, target);
  }

  export function getConstructorParams(target: Object): Object[] {
    return Reflect.getMetadata('inject:target:constructor', target) || [];
  }

  export function registerInjector(target: Object) {
    Reflect.defineMetadata('inject:target:injector', true, target);
  }

  export function checkInjector(target: Object): boolean {
    return Reflect.getMetadata('inject:target:injector', target);
  }
}
