var util = require('util')
  , Undefined = {}

function Optional(type) {
  if (!(this instanceof Optional)) {
    return new Optional(type)
  }

  this.type = type
}

function ObchecktError(message) {
  if (!(this instanceof ObchecktError)) {
    return new ObchecktError(message)
  }

  Error.call(this, message)
  this.name = 'ObchecktError'
  this.message = message
  this.stack = ''
}
util.inherits(ObchecktError, Error)

function validate(obj, format, key, callback) {
  if (typeof key === 'function') {
    callback = key
    key = null
  }

  if (!callback) {
    return validateSync(obj, format, key)
  }

  if (!_validate(obj, format, key || 'subject', callback)) {
    return false
  }

  callback(null)
  return true
}

function validateSync(obj, format, key) {
  return _validate(obj, format, key || 'subject', function (err) {
    throw err
  })
}

function check(cond, message, callback) {
  if (!cond) {
    callback(new ObchecktError(message))
  }

  return cond
}

function isTypeSpec(format) {
  if (typeof format === 'function') {
    return true
  }

  if (format && typeof format === 'object') {
    return Object.keys(format).every(function (key) {
      return isTypeSpec(format[key])
    })
  }

  return false
}

function _validate(obj, format, key, callback) {
  // Rule #0: If the format is undefined, anything goes.
  if (format === undefined) {
    return true
  }

  // Rule #1: If the format is null, we expect obj to not exist.
  if (format === null) {
    return check(
      obj == null,
      util.format('Expected %s to not exist, but found %j.', key, obj),
      callback
    )
  }

  // Rule #2: If the format is an Array, we expect obj to be an Array of valid elements.
  if (Array.isArray(format)) {
    if (!check(
      obj instanceof Array,
      util.format('Expected %s to be an Array, but found %j.', key, obj),
      callback
    )) {
      return false
    }

    if (format.length === 0) {
      return check(
        obj.length === 0,
        util.format('Expected %s to be empty, but found %j.', key, obj),
        callback
      )
    }

    if (format.length === 1 && isTypeSpec(format[0])) {
      return obj.every(function (item, index) {
        return _validate(item, format[0], key + '[index]', callback)
      })
    }

    if (!obj.every(function (item, index) {
      return _validate(item, format[index] || Undefined, key + '[index]', callback)
    })) {
      return false
    }

    return format.every(function (subformat, index) {
      return _validate(obj[index], subformat, key + '[index]', callback)
    })
  }

  // Rule #3: If the format is a Function, we expect obj to be an instance of that type.
  if (typeof format === 'function') {
    if (typeof obj === 'object') {
      return check(
        obj instanceof format,
        util.format('Expected %s to be an instance of %s, but found %j.', key, format.name || format, obj),
        callback
      )
    } else {
      return check(
        obj.constructor == format,
        util.format('Expected %s to be an instance of %s, but found %j.', key, format.name || format, obj),
        callback
      )
    }
  }

  // Rule #3.5: If the format is a RegExp, we expect obj to either be literally
  // the same RegExp or a matching String.
  if (format instanceof RegExp) {
    return check(
      format.test(obj),
      util.format('Expected %s to match %s, but found %j.', key, format, obj),
      callback
    )
  }

  // Rule #4: We expect Non-Array, Non-Function types to match
  if (!check(
    typeof obj === typeof format,
    util.format('Expected %s to be of type "%s", but found %j.', key, typeof format, obj),
    callback
  )) {
    return false
  }

  // Rule #5: We expect Non-Array, Non-Function, Non-Object values to match
  if (typeof format !== 'object') {
    return check(
      obj == format,
      util.format('Expected %s to equal %j, but found %j.', key, format, obj),
      callback
    )
  }

  // Rule #6: If format is an object, we expect obj to match format recursively.
  // (but first, let's be sure obj HAS keys...)
  if (!check(
    obj,
    util.format('Expected %s to be an Object, but found %j.', key, obj),
    callback
  )) {
    return false
  }

  return Object.keys(format).every(function (subkey) {
    var isOptional = format[subkey] instanceof Optional

    if (isOptional && obj[subkey] == null) {
      return true
    }

    if (format[subkey] === Undefined) {
      if (!check(
        obj[subkey] == null,
        util.format('Expected "%s.%s" to not exist, but found %j.', key, subkey, obj[subkey]),
        callback
      )) {
        return false
      }

      return true
    }

    if (!check(
      obj[subkey] !== undefined,
      util.format('Expected %s to have a property named "%s".', key, subkey),
      callback
    )) {
      return false
    }

    return _validate(obj[subkey], isOptional ? format[subkey].type : format[subkey], key + '.' + subkey, callback)
  })
}

module.exports = {
  validate: validate,
  validateSync: validateSync,
  Optional: Optional,
  Undefined: Undefined,
  ObchecktError: ObchecktError
}
