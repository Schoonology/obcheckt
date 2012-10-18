/*global describe:true, it:true, before:true, after:true, beforeEach:true, afterEach:true */
var expect = require('chai').expect
  , obcheckt = require('../lib/obcheckt');

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
      }).to.throw

      expect(function () {
        obcheckt.validate({
          key: 42
        }, {
          key: null
        })
      }).to.throw

      expect(function () {
        obcheckt.validate({
        }, {
          key: null
        })
      }).to.throw
    })
  })

  describe('Rule #2', function () {
    it('should pass valid Arrays', function () {
      obcheckt.validate([42], [Number])
      obcheckt.validate([1, 2, 3, 4, 5], [Number])
      obcheckt.validate([1, 2, 3, 'foo', true], [])

      obcheckt.validate({
        key: ['Earth']
      }, {
        key: [String]
      })

      obcheckt.validate([], [Boolean])
    })

    it('should fail invalid Arrays', function () {
      expect(function () {
        obcheckt.validate([42], [String])
      }).to.throw

      expect(function () {
        obcheckt.validate([1, 2, 3, 4, true], [Number])
      }).to.throw

      expect(function () {
        obcheckt.validate({
          key: ['Earth']
        }, {
          key: [Number]
        })
      }).to.throw
    })

    it('should fail non-Arrays', function () {
      expect(function () {
        obcheckt.validate({}, [])
      }).to.throw

      expect(function () {
        obcheckt.validate(42, [Number])
      }).to.throw
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
      }).to.throw

      expect(function () {
        obcheckt.validate({}, Number)
      }).to.throw

      expect(function () {
        obcheckt.validate(true, Object)
      }).to.throw

      expect(function () {
        obcheckt.validate('foo', Boolean)
      }).to.throw
    })
  })

  describe('Rule #4', function () {
    // Rule #5 is a superset. Rule #4 is just there for simpler info.
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
      }).to.throw

      expect(function () {
        obcheckt.validate('answer', 'foo')
      }).to.throw

      expect(function () {
        obcheckt.validate('answer', 42) // Rule #4
      }).to.throw

      expect(function () {
        obcheckt.validate({
          key: true
        }, {
          key: false
        })
      }).to.throw
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
      }).to.throw
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
      }).to.throw
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
      }).to.throw
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
})