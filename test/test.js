const package = require('../package.json');
const assert = require('assert');

beforeEach(() => {
});

before(() => {
});

after(() => {
});

/*
 * ============
 *  Test Cases
 * ============
 */
describe(`${package.name}`, () => {
  const _ = require('../lib/utilities.js');
  const lodash = require('lodash');

  // Utilities
  describe('.utilities()', () => {
    const sample = {
      main: {
        true: true,
        false: false,
        zero: 0,
        one: 1,
        string: 'string',
        stringEmpty: '',
        object: {},
        array: [],
        null: null,
        undefined: undefined,
        nan: NaN,
        infinity: Infinity,
        negativeInfinity: -Infinity,
        function: function () {},
      }
    }

    // Normal Cases
    describe('.get()', () => {
      it('should return true', () => {
        // console.log('---lodash', lodash.get(sample, 'main.true'));
        // console.log('---_.get', _.get(sample, 'main.true'));
        // console.log('---_.get2', _.get2(sample, 'main.true'));

        assert.strictEqual(_.get(sample, 'main.true'), true);
      });

      it('should return false', () => {
        assert.strictEqual(_.get(sample, 'main.false'), false);
      });

      it('should return 0', () => {
        assert.strictEqual(_.get(sample, 'main.zero'), 0);
      });

      it('should return 1', () => {
        assert.strictEqual(_.get(sample, 'main.one'), 1);
      });

      it('should return a string', () => {
        assert.strictEqual(_.get(sample, 'main.string'), 'string');
      });

      it('should return an empty string', () => {
        assert.strictEqual(_.get(sample, 'main.stringEmpty'), '');
      });

      it('should return an object', () => {
        assert.deepStrictEqual(_.get(sample, 'main.object'), {});
      });

      it('should return an array', () => {
        assert.deepStrictEqual(_.get(sample, 'main.array'), []);
      });

      it('should return null', () => {
        assert.strictEqual(_.get(sample, 'main.null'), null);
      });

      it('should return undefined', () => {
        assert.strictEqual(_.get(sample, 'main.undefined'), undefined);
      });

      it('should return NaN', () => {
        assert.strictEqual(Number.isNaN(_.get(sample, 'main.nan')), true);
      });

      it('should return Infinity', () => {
        assert.strictEqual(_.get(sample, 'main.infinity'), Infinity);
      });

      it('should return -Infinity', () => {
        assert.strictEqual(_.get(sample, 'main.negativeInfinity'), -Infinity);
      });

      it('should return a function', () => {
        assert.strictEqual(typeof _.get(sample, 'main.function'), 'function');
      });

      // Non-existent
      it('should return undefined', () => {
        assert.strictEqual(_.get(sample, 'main.nonexistent'), undefined);
      });

      // No path
      it('should return undefined', () => {
        assert.strictEqual(_.get(sample), undefined);
      });

      // Empty path
      it('should return undefined', () => {
        assert.strictEqual(_.get(sample, ''), undefined);
      });

      // Default value
      it('should return default value', () => {
        assert.strictEqual(_.get(sample, 'main.nonexistent', 'default'), 'default');
      });

      it('should return actual value', () => {
        assert.strictEqual(_.get(sample, 'main.false', 'default'), false);
      });

      it('should return actual value', () => {
        assert.strictEqual(_.get(sample, 'main.null', 'default'), null);
      });

      it('should return default value', () => {
        assert.strictEqual(_.get(sample, 'main.undefined', 'default'), 'default');
      });

      // Non-object for object
      it('should return undefined', () => {
        assert.strictEqual(_.get(undefined, 'main.true'), undefined);
      });

      it('should return undefined', () => {
        assert.strictEqual(_.get(null, 'main.true'), undefined);
      });

      it('should return undefined', () => {
        assert.strictEqual(_.get(false, 'main.true'), undefined);
      });

      it('should return undefined', () => {
        assert.strictEqual(_.get('', 'main.true'), undefined);
      });

    });

  });

})
