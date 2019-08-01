import { InjectMeta } from './global';
import { Injectable } from './injectable';

let RESOLVER_ID = 0;

@Injectable()
export class Resolver {
  private providers = new Set<Object>();

  private instances = new Map<Object, any>();

  private children: Resolver[] = [];

  private parent: Resolver;

  id = ++ RESOLVER_ID;

  constructor() {
    // TODO: make those consistent. prototype.constructor, prototype ?
    this.providers.add(Resolver.prototype.constructor);
    this.instances.set(Resolver.prototype, this);
  }

  addChild(resolver: Resolver) {
    resolver.parent = this;
    this.children.push(resolver);
  }

  removeChild(resolver: Resolver) {
    const idx = this.children.indexOf(resolver);
    resolver.parent = null;
    this.children.splice(idx);
  }

  addProvider(fn: Object) {
    if (this.providers.has(fn)) {
      throw Error('Duplicate provider');
    } else {
      this.providers.add(fn);0
    }
  }

  provide(providerPrototype: any) {
    if (!this.hasProvider(providerPrototype.constructor)) {
      throw {
        message: 'No such provider',
        provider: providerPrototype,
      };
    }

    let hostInstance;
    // 如果自身无此provider但是注入树上有该provider，则往父亲查找
    if (!this.hasOwnProvider(providerPrototype.constructor)) {
      hostInstance = this.parent.provide(providerPrototype);
    } else {
      hostInstance = this.resolve(providerPrototype);
      this.instances.set(providerPrototype, hostInstance);
    }
    return hostInstance;
  }

  resolve(providerPrototype: any) {
    // 如果hostPrototype也是Injector，利用Injector实例化并且建立父子关系
    const isInjector = InjectMeta.checkInjector(providerPrototype.constructor);
    const types = Reflect.getMetadata('design:paramtypes', providerPrototype.constructor);
    if (isInjector) {
      const injectorInstance = new providerPrototype.constructor(this);
      return injectorInstance;
    }

    if (this.instances.has(providerPrototype)) {
      return this.instances.get(providerPrototype);
    }

    const constructorParams = InjectMeta.getConstructorParams(providerPrototype);
    const paramInstances = constructorParams.map((paramPrototype) => this.provide(paramPrototype));
    const hostInstance = new providerPrototype.constructor(...paramInstances);

    const properties = InjectMeta.getProperties(providerPrototype);
    Object.keys(properties).forEach((key) => {
      const propertyPrototype = properties[key];
      const instance = this.provide(propertyPrototype);
      hostInstance[key] = instance;
    });

    return hostInstance;
  }

  hasOwnProvider(providerConstructor: any) {
    return this.providers.has(providerConstructor);
  }

  hasProvider(providerConstructor: any) {
    let host: Resolver = this;
    while (host) {
      if (host.providers.has(providerConstructor)) {
        return true;
      }
      host = host.parent;
    }
    return false;
  }
}

