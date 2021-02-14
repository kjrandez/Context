export function mapObj<T, R>(
  obj: { [_: string]: T},
  valueMapping: (_: T) => R,
  keyMapping: (_: string) => string = (K) => K,
) {
  return Object.assign({}, ...Object.entries(obj).map(
       ([K, V]: [string, T]) => ({[keyMapping(K)]: valueMapping(V)}) 
  ));
}

export type StrDict<T> = {[_: string]: T};
export type NumDict<T> = {[_: number]: T};

export type Value = {[_: string]: any}
export interface Model<T extends Value> {id: number, type: string, value: T}

export type PageEntry = {key: number, element: Proxy};
export type PageValue = {entries: PageEntry[]}
export type TextValue = {content: string}

export interface Proxyable {
  proxyableId: number | null;
}
export class Proxy
{
  id: number;
  dispatchCall: Function;

  constructor(tag: number, dispatcher: Function) {
      this.dispatchCall = dispatcher
      this.id = tag;
  }

  async call<T>(selector: string, args: any[] = []): Promise<T> {
      return await this.dispatchCall(this.id, selector, args, true);
  }

  send(selector: string, args: any[] = []) {
      this.dispatchCall(this.id, selector, args, false);
  }
}


export type Argument = {
  type: string;
  value: any;
}

class TagCache<T>
{
  refs: T[] = [];
  nextIndex: number = 0;
  freeIndexes: number[] = [];

  assignTag(object: T) {
      let index: number | undefined = this.freeIndexes.pop();
      if (index !== undefined) {
          this.refs[index] = object;
          return index;
      }
      else {
          this.refs.push(object);
          index = this.nextIndex ++;
          return index;
      }
  }

  getObject(tag: number) {
      return this.refs[tag];
  }

  freeTag(tag: number) {
      this.freeIndexes.push(tag)
  }
}

class ProxyableTable
{
  refs: Proxyable[];
  index: number = 0;

  constructor(rootObject: Proxyable) {
      rootObject.proxyableId = 0;
      this.refs = [rootObject];
  }

  getObject(tag: number) {
      return this.refs[tag];
  }

  getTag(object: Proxyable) {
      if (object.proxyableId == null) {
          object.proxyableId = ++ this.index;
          this.refs.push(object);
      }

      return object.proxyableId;
  }
}

class ProxyMap
{
  make: Function;
  refs: { [_: number]: Proxy } = {};

  constructor(makeProxy: Function) {
      this.make = makeProxy;
  }

  getObject(tag: number) {
      if (tag in this.refs)
          return this.refs[tag];

      let proxy = this.make(tag);
      this.refs[tag] = proxy;
      return proxy;
  }
}

export type TransactionModel = {
  id: number,
  subject: Proxy,
  others: Proxy[],
  value: any
}

export class Rpc
{
pendingCalls: TagCache<Function> = new TagCache<Function>();
  localObjects: ProxyableTable;
  foreignObjects: ProxyMap;

constructor(service: Proxyable, private send: (_: string) => void) {
  let dispatcher = this.dispatchCall.bind(this);
      this.foreignObjects = new ProxyMap((tag: number) => new Proxy(tag, dispatcher));
      
  this.localObjects = new ProxyableTable(service);
}

dispatchCall(targetId: number, selector: string, args: any[]) {
      let argDescs: Argument[] = args.map((X: any) => this.encodedArgument(X));
      
      return new Promise<any>((resolve, reject) => this.dispatchWebsocketSend({
          type: 'call',
          id: this.pendingCalls.assignTag(resolve),
          target: targetId,
          selector: selector,
          arguments: argDescs
      }));
  }

dispatchWebsocketSend(data: object) {
      this.send(JSON.stringify(data));
  }

handleWebsocketReceive(msg: any) {
    console.log(msg);
      switch(msg.type) {
          case 'send':
              this.handleSend(msg.target, msg.selector, msg.arguments);
              break;
          case 'call':
              this.handleCall(msg.id, msg.target, msg.selector, msg.arguments);
              break;
          case 'return':
              this.handleReturn(msg.id, msg.result)
              break;
          default:
              console.log("Invalid message received:");
              console.log(msg);
              break;
      }
  }

handleSend(targetId: number, selector: string, argDescs: Argument[]) {
      let target: Proxyable = this.localObjects.getObject(targetId);
      let args: any[] = argDescs.map((X: any) => this.decodedArgument(X));

      (target as any)[selector].apply(target, args)
  }
handleCall(foreignId: number, targetId: number, selector: string, argDescs: Argument[]) {
      let target: Proxyable = this.localObjects.getObject(targetId);
      let args: any[] = argDescs.map((X: any) => this.decodedArgument(X));
      console.log("target is");  
      console.log(target)
      try {
        let result = (target as any)[selector].apply(target, args)
        console.log("Call yielded: ");
        console.log(result);
        this.dispatchWebsocketSend({
            type: 'return',
            id: foreignId,
            result: this.encodedArgument(result)
        });
    }
    catch(err) {
        console.log(err);
    }
  }

  handleReturn(localId: number, resultDesc: any) {
      let result = this.decodedArgument(resultDesc);
      let resolve = this.pendingCalls.getObject(localId);
      this.pendingCalls.freeTag(localId);

      resolve(result);
  }

  decodedArgument(argDesc: Argument): any {
      if (argDesc.type === 'localObject')
          return this.foreignObjects.getObject(argDesc.value)
      else if (argDesc.type === 'foreignObject')
          return this.localObjects.getObject(argDesc.value);
      else if (argDesc.type === 'list')
          return argDesc.value.map((X: any) => this.decodedArgument(X))
      else if (argDesc.type === 'dictionary')
          return mapObj(argDesc.value, (X: any) => this.decodedArgument(X))
      else // primitive
          return argDesc.value;
  }

  encodedArgument(arg: any): Argument {
      if (arg instanceof Proxy) 
          return { type: 'foreignObject', value: arg.id };
      else if (Object(arg) === arg && 'proxyableId' in arg) {
            console.log("encoding a proxyable");  
        return { type: 'localObject', value: this.localObjects.getTag(arg) };
      }
      else if (arg instanceof Array)
          return { type: 'list', value: arg.map(X => this.encodedArgument(X))}
      else if (arg instanceof Object)
          return { type: 'dictionary', value: mapObj(arg, X => this.encodedArgument(X))}
      else
          return { type: 'primitive', value: arg };
  }
}
