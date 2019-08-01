import { Type } from './typing';
import { Resolver } from './resolver';
import { InjectMeta } from './global';

export class InjectorParams {
  providers: any[];
}

/**
 * 目前限制：定义Injector类不能在constructor里传参 constructor(private: a) 为非法。需要注入请使用 @Inject
 * TODO: 解决该限制
 * @param params 定义可注入的依赖
 */
export function Injector(params?: InjectorParams) {
  return function <T extends Type<{}>> (target: T) {
    InjectMeta.registerInjector(target);

    return class extends target {
      resolver: Resolver;

      constructor(...args) {
        super(...args);
        console.log('初始化');
        this.resolver = new Resolver();
        if (args.length > 0) {
          const parentResolver = args[0] as Resolver;
          parentResolver.addChild(this.resolver);
        }
        if (params) {
          params.providers.forEach((provider) => {
            this.resolver.addProvider(provider);
          });
        }

        const property = InjectMeta.getProperties(target.prototype);
        Object.keys(property).forEach((key) => {
          const propertyPrototype = property[key];
          this[key] = this.resolver.provide(propertyPrototype);
        });
      }
    };
  };
}

export function Inject() {
  return function(target, propertyKey) {
    const type = Reflect.getMetadata('design:type', target, propertyKey);
    InjectMeta.addProperty(target, propertyKey, type.prototype);
    return;
  };
}
