var util = require('util')

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

function _validate(obj, format, key, callback) {
  // Rule #0: If the format is undefined, anything goes.
  if (format === undefined) {
    return true
  }

  // Rule #1: If the format is null, we expect obj to not exist.
  if (format === null) {
    return check(
      obj == null
    , util.format('Expected "%s" to not exist', key)
    , callback
    )
  }

  // Rule #2: If the format is an Array, we expect obj to be an Array of valid elements.
  if (Array.isArray(format)) {
    if (!check(
      obj instanceof Array
    , util.format('Expected "%s" to be an Array', key)
    , callback
    )) {
      return false
    }

    return obj.every(function (item) {
      return _validate(item, format[0], key + '[index]', callback)
    })
  }

  // Rule #3: If the format is a Function, we expect obj to be an instance of that type.
  if (typeof format === 'function') {
    if (typeof obj === 'object') {
      return check(
        obj instanceof format
      , util.format('Expected "%s" to be an instance of %s', key, format.name || format)
      , callback
      )
    } else {
      return check(
        obj.constructor == format
      , util.format('Expected "%s" to be an instance of %s', key, format.name || format)
      , callback
      )
    }
  }

  // Rule #4: We expect Non-Array, Non-Function types to match
  if (!check(
    typeof obj === typeof format
  , util.format('Expected "%s" to be of type "%s"', key, typeof format)
  , callback
  )) {
    return false
  }

  // Rule #5: We expect Non-Array, Non-Function, Non-Object values to match
  if (typeof format !== 'object') {
    return check(
      obj == format
    , util.format('Expected "%s" to equal', format, 'but it was', obj)
    , callback
    )
  }

  // Rule #6: If format is an object, we expect obj to match format recursively.
  // (but first, let's be sure obj HAS keys...)
  if (!check(
    obj
  , util.format('Expected "%s" to be an Object', key)
  , callback
  )) {
    return false
  }

  return Object.keys(format).every(function (subkey) {
    var isOptional = format[subkey] instanceof Optional

    if (isOptional && obj[subkey] == null) {
      return true
    }

    if (!check(
      obj[subkey] !== undefined
    , util.format('Expected "%s" to have a property "%s"', key, subkey)
    , callback
    )) {
      return false
    }

    return _validate(obj[subkey], isOptional ? format[subkey].type : format[subkey], key + '.' + subkey, callback)
  })
}

module.exports = {
  validate: validate
, validateSync: validateSync
, Optional: Optional
, ObchecktError: ObchecktError
}
