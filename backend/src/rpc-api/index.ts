var commands = require('./commands')
var rpc = require('./jsonrpc')

// ===----------------------------------------------------------------------===//
// JsonRPC
// ===----------------------------------------------------------------------===//
function Client (opts) {
  // @ts-ignore
  this.rpc = new rpc.JsonRPC(opts)
}

// ===----------------------------------------------------------------------===//
// cmd
// ===----------------------------------------------------------------------===//
Client.prototype.cmd = function () {
  var args = [].slice.call(arguments)
  var cmd = args.shift()

  callRpc(cmd, args, this.rpc)
}

// ===----------------------------------------------------------------------===//
// callRpc
// ===----------------------------------------------------------------------===//
function callRpc (cmd, args, rpc) {
  var fn = args[args.length - 1]

  // If the last argument is a callback, pop it from the args list
  if (typeof fn === 'function') {
    args.pop()
  } else {
    fn = function () {}
  }

  return rpc.call(cmd, args, function () {
    var args = [].slice.call(arguments)
      // @ts-ignore
    args.unshift(null)
      // @ts-ignore
    fn.apply(this, args)
  }, function (err) {
    fn(err)
  })
}

// ===----------------------------------------------------------------------===//
// Initialize wrappers
// ===----------------------------------------------------------------------===//

// Bitcoin Core 30.x strictly enforces that the `algo` param for
// getDifficulty and getNetworkHashPs must be a string, not a number.
// Coerce 0 → "meowpow" and 1 → "scrypt" transparently here so callers
// can continue using numeric constants internally.
function coerceAlgoArg(args: any[], algoPosition: number): any[] {
  const out = args.slice()
  if (out.length > algoPosition && typeof out[algoPosition] === 'number') {
    out[algoPosition] = out[algoPosition] === 0 ? 'meowpow' : 'scrypt'
  }
  return out
}

const ALGO_COERCE_COMMANDS: Record<string, number> = {
  getDifficulty: 0,    // arg 0 is algo
  getNetworkHashPs: 2, // args 0=nblocks, 1=height, 2=algo
}

;(function () {
  for (var protoFn in commands) {
    (function (protoFn) {
      Client.prototype[protoFn] = function () {
        var args = [].slice.call(arguments)
        if (protoFn in ALGO_COERCE_COMMANDS) {
          args = coerceAlgoArg(args, ALGO_COERCE_COMMANDS[protoFn])
        }
        return callRpc(commands[protoFn], args, this.rpc)
      }
    })(protoFn)
  }
})()

// Export!
module.exports.Client = Client;
