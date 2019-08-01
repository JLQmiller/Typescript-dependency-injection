import {Injectable} from './injectable';
import {Injector, Inject} from './injector';
import { Resolver } from './resolver';

@Injectable()
class InjectableClassA {
  static couter = 0;

  id = ++ InjectableClassA.couter;

  constructor() {
    console.log('InjectableClassA construct', this.id);
  }
}

@Injectable()
class InjectableClassB {
  id = 'b';
  obj = {key: 1};

  @Inject() a: InjectableClassA;
  constructor() {
  }
}

@Injectable()
@Injector({
  providers: [
    InjectableClassA,
  ],
})
class InjectableHostClass {
  id = 'c';

  @Inject() a: InjectableClassA;

  @Inject() resolver: Resolver;

  constructor() {
  }
}

@Injector({
  providers: [
    InjectableClassA,
  ],
})
class InjectableHostClass2 {
  id = 'c';

  @Inject() a: InjectableClassA;

  @Inject() resolver: Resolver;

  @Inject() parentInjection: InjectableHostClass;

  constructor() {
  }
}


@Injectable()
class HostClass {
  @Inject() a: InjectableClassA;
  constructor(private b: InjectableClassB) {
  }
}

@Injectable()
class ResolveLaterClass {
  constructor(private a: InjectableClassA) {
    console.log('ResolveLaterClass', a);
  }
}

@Injector({
  providers: [
    InjectableClassA,
    InjectableClassB,
    HostClass,
    InjectableHostClass,
  ],
})
class App {
  @Inject() host: HostClass;

  @Inject() resolver: Resolver;

  @Inject() childHost: InjectableHostClass;

  constructor() {
    console.log('App host', this.host);

    setTimeout(() => {
      const injectLater = this.resolver.resolve(ResolveLaterClass.prototype);
      console.log('injectLater', injectLater);
      console.log('childHost', this.childHost);
      console.log('this.childHost.a.id', this.childHost.a.id);
      console.log('this.host.a.id', this.host.a.id);

      const childHost2 = this.resolver.resolve(InjectableHostClass2.prototype);
      console.log('childHost2', childHost2);
    }, 1000);
  }
}

console.log('new app');
const app = new App();
console.log(app);


