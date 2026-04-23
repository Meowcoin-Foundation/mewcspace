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

// Bitcoin Core 30.x strictly enforces RPC argument types. Two fixes applied
// transparently at the client level so callers need no changes:
//   1. algo must be a string ("meowpow"/"scrypt"), not a number (0/1)
//   2. nblocks must be a positive integer or -1; 0 is rejected — fall back to 120
function coerceNetworkHashPsArgs(args: any[]): any[] {
  const out = args.slice()
  // arg 0: nblocks — 0 is invalid, default to 120
  if (out.length >= 1 && out[0] === 0) {
    out[0] = 120
  }
  // arg 2: algo — coerce numeric to string
  if (out.length > 2 && typeof out[2] === 'number') {
    out[2] = out[2] === 0 ? 'meowpow' : 'scrypt'
  }
  return out
}

function coerceDifficultyArgs(args: any[]): any[] {
  const out = args.slice()
  // arg 0: algo — coerce numeric to string
  if (out.length > 0 && typeof out[0] === 'number') {
    out[0] = out[0] === 0 ? 'meowpow' : 'scrypt'
  }
  return out
}

;(function () {
  for (var protoFn in commands) {
    (function (protoFn) {
      Client.prototype[protoFn] = function () {
        var args: any[] = [].slice.call(arguments)
        if (protoFn === 'getNetworkHashPs') {
          args = coerceNetworkHashPsArgs(args)
        } else if (protoFn === 'getDifficulty') {
          args = coerceDifficultyArgs(args)
        }
        return callRpc(commands[protoFn], args, this.rpc)
      }
    })(protoFn)
  }
})()

// Export!
module.exports.Client = Client;
