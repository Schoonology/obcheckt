/*global describe:true, it:true, before:true, after:true, beforeEach:true, afterEach:true */
var expect = require('chai').expect
  , obcheckt = require('../lib/obcheckt')
  , ObchecktError = obcheckt.ObchecktError

describe('Obcheckt', function () {
  describe('Rule #0', function () {
    it('should pass anything', function () {
      obcheckt.validate(null)
      obcheckt.validate(true)
      obcheckt.validate(42)
      obcheckt.validate(false)
      obcheckt.validate('answer')
      obcheckt.validate(new Error())
      obcheckt.validate({})
      obcheckt.validate([])
    })
  })

  describe('Rule #1', function () {
    it('should pass null values', function () {
      obcheckt.validate(null, null)

      obcheckt.validate({
        key: null
      }, {
        key: null
      })
    })

    it('should fail non-null values', function () {
      expect(function () {
        obcheckt.validate(42, null)
      }).to.throw(ObchecktError)

      expect(function () {
        obcheckt.validate({
          key: 42
        }, {
          key: null
        })
      }).to.throw(ObchecktError)

      expect(function () {
        obcheckt.validate({
        }, {
          key: null
        })
      }).to.throw(ObchecktError)
    })
  })

  describe('Rule #2', function () {
    it('should pass valid Arrays', function () {
      obcheckt.validate([42], [Number])
      obcheckt.validate([1, 2, 3, 4, 5], [Number])
      obcheckt.validate([1, 2, 3, 4, 5], [1, 2, 3, 4, 5])

      obcheckt.validate({
        key: ['Earth']
      }, {
        key: [String]
      })

      obcheckt.validate([], [Boolean])
      obcheckt.validate([{
        name: 'Sally'
      }, {
        name: 'John'
      }], [{
        name: String
      }])
    })

    it('should fail invalid Arrays', function () {
      expect(function () {
        obcheckt.validate([42], [String])
      }).to.throw(ObchecktError)

      expect(function () {
        obcheckt.validate([1, 2, 3, 4, true], [Number])
      }).to.throw(ObchecktError)

      expect(function () {
        obcheckt.validate([1, 2, 3, 'foo', true], [])
      }, 'array is not empty').to.throw(ObchecktError)

      expect(function () {
        obcheckt.validate([1, 2, 3, 4, 5], [5, 4, 3, 2, 1])
      }).to.throw(ObchecktError)

      expect(function () {
        obcheckt.validate([1, 2, 3, 4, 5], [1, 1, 1, 1, 1])
      }).to.throw(ObchecktError)

      expect(function () {
        obcheckt.validate([1, 1], [1])
      }, 'array is too long').to.throw(ObchecktError)

      expect(function () {
        obcheckt.validate([1], [1, 1])
      }, 'array is too short').to.throw(ObchecktError)

      expect(function () {
        obcheckt.validate({
          key: ['Earth']
        }, {
          key: [Number]
        })
      }).to.throw(ObchecktError)

      expect(function () {
        obcheckt.validate([{
          name: 42
        }, {
          name: 'John'
        }], [{
          name: Number
        }])
      }, 'mixed objects, type spec').to.throw(ObchecktError)
    })

    it('should fail non-Arrays', function () {
      expect(function () {
        obcheckt.validate({}, [])
      }).to.throw(ObchecktError)

      expect(function () {
        obcheckt.validate(42, [Number])
      }).to.throw(ObchecktError)
    })
  })

  describe('Rule #3', function () {
    it('should pass valid instances', function () {
      obcheckt.validate({}, Object)
      obcheckt.validate(42, Number)
      obcheckt.validate('answer', String)
      obcheckt.validate(true, Boolean)

      obcheckt.validate({
        key: 6
      }, {
        key: Number
      })
    })

    it('should fail invalid instances', function () {
      expect(function () {
        obcheckt.validate(42, String)
      }).to.throw(ObchecktError)

      expect(function () {
        obcheckt.validate({}, Number)
      }).to.throw(ObchecktError)

      expect(function () {
        obcheckt.validate(true, Object)
      }).to.throw(ObchecktError)

      expect(function () {
        obcheckt.validate('foo', Boolean)
      }).to.throw(ObchecktError)
    })
  })

  describe('Rule #4', function () {
    // Rule #5 is a superset. Rule #4 is just there for simpler info.
  })

  describe('Rule #3.5', function () {
    it('should pass strings that match regexes', function () {
      obcheckt.validate('test', /test/)
      obcheckt.validate('longer value', /val/)
      obcheckt.validate({
        key: 'value'
      }, {
        key: /^value$/
      })
    })

    it('should fail strings that miss regexes', function () {
      expect(function () {
        obcheckt.validate('foo', /bar/)
      }).to.throw(ObchecktError)

      expect(function () {
        obcheckt.validate(42, /bar/)
      }).to.throw(ObchecktError)

      expect(function () {
        obcheckt.validate({
          key: 'right'
        }, {
          key: /^wrong$/
        })
      }).to.throw(ObchecktError)
    })
  })

  describe('Rule #5', function () {
    it('should pass identical primitive values', function () {
      obcheckt.validate(42, 42)
      obcheckt.validate('answer', 'answer')

      obcheckt.validate({
        key: true
      }, {
        key: true
      })
    })

    it('should fail unequal primitive values', function () {
      expect(function () {
        obcheckt.validate(42, 23)
      }).to.throw(ObchecktError)

      expect(function () {
        obcheckt.validate('answer', 'foo')
      }).to.throw(ObchecktError)

      expect(function () {
        obcheckt.validate('answer', 42) // Rule #4
      }).to.throw(ObchecktError)

      expect(function () {
        obcheckt.validate({
          key: true
        }, {
          key: false
        })
      }).to.throw(ObchecktError)
    })
  })

  describe('Rule #6', function () {
    it('should pass objects with only valid keys', function () {
      obcheckt.validate({
        a: 42
      , b: true
      , c: ['answer']
      }, {
        a: 42
      , b: Boolean
      , c: [String]
      })
    })

    it('should pass objects with extra keys', function () {
      obcheckt.validate({
        a: 42
      , b: true
      , c: ['answer']
      }, {
      })
    })

    it('should fail objects with at least one invalid key', function () {
      expect(function () {
        obcheckt.validate({
          a: 42
        , b: true
        , c: ['answer']
        }, {
          a: 42
        , b: Boolean
        , c: String
        })
      }).to.throw(ObchecktError)
    })

    it('should fail objects with missing keys', function () {
      expect(function () {
        obcheckt.validate({
          a: 42
        , c: ['answer']
        }, {
          a: 42
        , b: Boolean
        , c: [String]
        })
      }).to.throw(ObchecktError)
    })

    it('should fail null "object"s', function () {
      expect(function () {
        obcheckt.validate(null, {
          key: String
        })
      }).to.throw(ObchecktError)
    })
  })

  describe('Optional', function () {
    it('should pass correctly-defined Optional values', function () {
      obcheckt.validate({
        key: 42
      }, {
        key: obcheckt.Optional(Number)
      })
    })

    it('should fail on incorrectly-defined Optional values', function () {
      expect(function () {
        obcheckt.validate({
          key: 42
        }, {
          key: String
        })
      }).to.throw(ObchecktError)
    })

    it('should ignore null Optional values', function () {
      obcheckt.validate({
        key: null
      }, {
        key: obcheckt.Optional(Number)
      })
    })

    it('should ignore undefined Optional values', function () {
      obcheckt.validate({
      }, {
        key: obcheckt.Optional(Number)
      })
    })
  })

  describe('Undefined', function () {
    it('should pass on missing key', function () {
      obcheckt.validate({}, {
        key: obcheckt.Undefined
      })
    })

    it('should pass on undefined key', function () {
      obcheckt.validate({
        key: undefined
      }, {
        key: obcheckt.Undefined
      })
    })

    it('should pass on null key', function () {
      obcheckt.validate({
        key: null
      }, {
        key: obcheckt.Undefined
      })
    })

    it('should fail on non-null, non-undefined values', function () {
      expect(function () {
        obcheckt.validate({
          key: 42
        }, {
          key: obcheckt.Undefined
        })
      }).to.throw(ObchecktError)

      expect(function () {
        obcheckt.validate({
          key: false
        }, {
          key: obcheckt.Undefined
        })
      }).to.throw(ObchecktError)

      expect(function () {
        obcheckt.validate({
          key: {}
        }, {
          key: obcheckt.Undefined
        })
      }).to.throw(ObchecktError)

      expect(function () {
        obcheckt.validate({
          key: 'answer'
        }, {
          key: obcheckt.Undefined
        })
      }).to.throw(ObchecktError)
    })
  })
})
