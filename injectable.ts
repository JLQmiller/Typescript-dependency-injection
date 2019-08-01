import 'reflect-metadata';
import {Type} from './typing';
import {InjectMeta} from './global';

export function Injectable<T extends Type<{}>>(params?: any) {
  return _injectable;
}

// TODO: 在angular prod 构建模式下异常
function _injectable<T extends Type<{}>>(target: T) {
  const types = Reflect.getMetadata('design:paramtypes', target);
  if (types) {
    const paramPrototypes = types.map((type) => type.prototype);
    InjectMeta.setConstructorParams(target.prototype, paramPrototypes);
  }
}
