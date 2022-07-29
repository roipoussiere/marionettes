import * as THREE from 'three'
import * as Serializer from '../src/serializer'


describe('Testing NumberSerializer', () => {
	const serializer = new Serializer.NumberSerializer(-180, 180)

	test('stringToDiscreteValue()', () => {
		expect(serializer.stringToDiscreteValue('Z')).toBe(0)
		expect(serializer.stringToDiscreteValue('0')).toBe(30)
		expect(serializer.stringToDiscreteValue('z')).toBe(59)
		expect(() => serializer.stringToDiscreteValue('?')).toThrow(Serializer.SerializationError)
		expect(() => serializer.stringToDiscreteValue('00')).toThrow(Serializer.SerializationError)
	})

	test('discreteValueTostring()', () => {
		expect(serializer.discreteValueTostring(0 )).toBe('Z')
		expect(serializer.discreteValueTostring(30)).toBe('0')
		expect(serializer.discreteValueTostring(59)).toBe('z')
		expect(() => serializer.discreteValueTostring(-1)).toThrow(Serializer.SerializationError)
		expect(() => serializer.discreteValueTostring(60)).toThrow(Serializer.SerializationError)
	})

	test('discretize()', () => {
		expect(serializer.discretize(-181)).toBe(0)
		expect(serializer.discretize(-180)).toBe(0)
		expect(serializer.discretize( 0  )).toBe(30)
		expect(serializer.discretize( 174)).toBe(59)
		expect(serializer.discretize( 180)).toBe(59)
	})

	test('makeContinuous()', () => {
		expect(serializer.makeContinuous(-1)).toBe(-180)
		expect(serializer.makeContinuous(0 )).toBe(-180)
		expect(serializer.makeContinuous(30)).toBe(0)
		expect(serializer.makeContinuous(59)).toBe(174)
		expect(serializer.makeContinuous(60)).toBe(174)
	})

	test('fromString()', () => {
		expect(serializer.fromString('Z')).toBe(-180)
		expect(serializer.fromString('0')).toBe(0)
		expect(serializer.fromString('z')).toBe(174)
	})

	test('toString()', () => {
		expect(serializer.toString(-181)).toBe('Z')
		expect(serializer.toString(-180)).toBe('Z')
		expect(serializer.toString( 0  )).toBe('0')
		expect(serializer.toString( 174)).toBe('z')
		expect(serializer.toString( 180)).toBe('z')
	})

	test('round()', () => {
		expect(serializer.round(-190)).toBe(-180)
		expect(serializer.round( 1)).toBe(0)
		expect(serializer.round( 190)).toBe(174)
	})
})


describe('Testing NumberSerializerDoublePrecision', () => {
	const serializer = new Serializer.NumberSerializerDoublePrecision(-180, 180)

	test('stringToDiscreteValue()', () => {
		expect(serializer.stringToDiscreteValue('ZZ')).toStrictEqual([ 0 , 0  ])
		expect(serializer.stringToDiscreteValue('00')).toStrictEqual([ 30, 30 ])
		expect(serializer.stringToDiscreteValue('zz')).toStrictEqual([ 59, 59 ])
		expect(() => serializer.stringToDiscreteValue('??')).toThrow(Serializer.SerializationError)
		expect(() => serializer.stringToDiscreteValue('0')).toThrow(Serializer.SerializationError)
		expect(() => serializer.stringToDiscreteValue('000')).toThrow(Serializer.SerializationError)
	})

	test('discreteValueTostring()', () => {
		expect(serializer.discreteValueTostring([ 0 , 0   ])).toBe('ZZ')
		expect(serializer.discreteValueTostring([ 30 , 30 ])).toBe('00')
		expect(serializer.discreteValueTostring([ 59, 59  ])).toBe('zz')
		expect(() => serializer.discreteValueTostring([ -1, 30 ])).toThrow(Serializer.SerializationError)
		expect(() => serializer.discreteValueTostring([ 60, 30 ])).toThrow(Serializer.SerializationError)
		expect(() => serializer.discreteValueTostring([ 30, -1 ])).toThrow(Serializer.SerializationError)
		expect(() => serializer.discreteValueTostring([ 30, 60 ])).toThrow(Serializer.SerializationError)
	})

	test('discretize()', () => {
		expect(serializer.discretize(-181  )).toStrictEqual([ 0 , 0  ])
		expect(serializer.discretize(-180  )).toStrictEqual([ 0 , 0  ])
		expect(serializer.discretize( 0    )).toStrictEqual([ 30, 0  ])
		expect(serializer.discretize( 0.1  )).toStrictEqual([ 30, 1  ])
		expect(serializer.discretize( 1    )).toStrictEqual([ 30, 10 ])
		expect(serializer.discretize( 179.9)).toStrictEqual([ 59, 59 ])
		expect(serializer.discretize( 180  )).toStrictEqual([ 59, 59 ])
	})

	test('makeContinuous()', () => {
		expect(serializer.makeContinuous([ -1, 0  ])).toBe(-180)
		expect(serializer.makeContinuous([ 0 , 0  ])).toBe(-180)
		expect(serializer.makeContinuous([ 30, 0  ])).toBe(0)
		expect(serializer.makeContinuous([ 30, 1  ])).toBe(0.1)
		expect(serializer.makeContinuous([ 30, 10 ])).toBe(1)
		expect(serializer.makeContinuous([ 59, 59 ])).toBe(179.9)
		expect(serializer.makeContinuous([ 60, 0  ])).toBe(179.9)
	})

	test('fromString()', () => {
		expect(serializer.fromString('ZZ')).toBe(-180)
		expect(serializer.fromString('0Z')).toBe(0)
		expect(serializer.fromString('zz')).toBe(179.9)
	})

	test('toString()', () => {
		expect(serializer.toString(-180)).toBe('ZZ')
		expect(serializer.toString( 0  )).toBe('0Z')
		expect(serializer.toString( 180)).toBe('zz')
	})

	test('round()', () => {
		expect(serializer.round(-190)).toBe(-180)
		expect(serializer.round( 0.1)).toBe(0.1)
		expect(serializer.round( 190)).toBe(179.9)
	})
})


const vectm190 = new THREE.Vector3(-190, -190, -190)
const vectm180 = new THREE.Vector3(-180, -180, -180)
const vect0 = new THREE.Vector3(0, 0, 0)
const vect0_1 = new THREE.Vector3(0.1, 0.1, 0.1)
const vect1 = new THREE.Vector3(1, 1, 1)
const vect30 = new THREE.Vector3(30, 30, 30)
const vect59 = new THREE.Vector3(59, 59, 59)
const vect174 = new THREE.Vector3(174, 174, 174)
const vect179_9 = new THREE.Vector3(179.9, 179.9, 179.9)
const vect180 = new THREE.Vector3(180, 180, 180)


describe('Testing Vector3Serializer', () => {
	const serializer = new Serializer.Vector3Serializer(vectm180, vect180)

	test('stringToDiscreteValue()', () => {
		expect(serializer.stringToDiscreteValue('ZZZ')).toStrictEqual(vect0)
		expect(serializer.stringToDiscreteValue('000')).toStrictEqual(vect30)
		expect(serializer.stringToDiscreteValue('zzz')).toStrictEqual(vect59)
	})

	test('discreteValueTostring()', () => {
		expect(serializer.discreteValueTostring(vect0 )).toBe('ZZZ')
		expect(serializer.discreteValueTostring(vect30)).toBe('000')
		expect(serializer.discreteValueTostring(vect59)).toBe('zzz')
	})

	test('discretize()', () => {
		expect(serializer.discretize(vectm180)).toStrictEqual(vect0)
		expect(serializer.discretize(vect0   )).toStrictEqual(vect30)
		expect(serializer.discretize(vect174 )).toStrictEqual(vect59)
	})

	test('makeContinuous()', () => {
		expect(serializer.makeContinuous(vect0 )).toStrictEqual(vectm180)
		expect(serializer.makeContinuous(vect30)).toStrictEqual(vect0)
		expect(serializer.makeContinuous(vect59)).toStrictEqual(vect174)
	})

	test('fromString()', () => {
		expect(serializer.fromString('ZZZ')).toStrictEqual(vectm180)
		expect(serializer.fromString('000')).toStrictEqual(vect0)
		expect(serializer.fromString('zzz')).toStrictEqual(vect174)
	})

	test('toString()', () => {
		expect(serializer.toString(vectm180)).toBe('ZZZ')
		expect(serializer.toString(vect0   )).toBe('000')
		expect(serializer.toString(vect174 )).toBe('zzz')
	})

	test('round()', () => {
		expect(serializer.round(vectm190)).toStrictEqual(vectm180)
		expect(serializer.round(vect0_1)).toStrictEqual(vect0)
		expect(serializer.round(vect180)).toStrictEqual(vect174)
	})
})


describe('Testing Vector3SerializerDoublePrecision', () => {
	const serializer = new Serializer.Vector3SerializerDoublePrecision(vectm180, vect180)

	test('stringToDiscreteValue()', () => {
		expect(serializer.stringToDiscreteValue('ZZZZZZ')).toStrictEqual([ vect0 , vect0  ])
		expect(serializer.stringToDiscreteValue('000000')).toStrictEqual([ vect30, vect30 ])
		expect(serializer.stringToDiscreteValue('zzzzzz')).toStrictEqual([ vect59, vect59 ])
	})

	test('discreteValueTostring()', () => {
		expect(serializer.discreteValueTostring([ vect0 , vect0  ])).toBe('ZZZZZZ')
		expect(serializer.discreteValueTostring([ vect30, vect30 ])).toBe('000000')
		expect(serializer.discreteValueTostring([ vect59, vect59 ])).toBe('zzzzzz')
	})

	test('discretize()', () => {
		expect(serializer.discretize(vectm180 )).toStrictEqual([ vect0 , vect0  ])
		expect(serializer.discretize(vect0    )).toStrictEqual([ vect30, vect0  ])
		expect(serializer.discretize(vect0_1  )).toStrictEqual([ vect30, vect1  ])
		expect(serializer.discretize(vect179_9)).toStrictEqual([ vect59, vect59 ])
	})

	test('makeContinuous()', () => {
		expect(serializer.makeContinuous([ vect0 , vect0 ])).toStrictEqual(vectm180)
		expect(serializer.makeContinuous([ vect30, vect0 ])).toStrictEqual(vect0)
		expect(serializer.makeContinuous([ vect30, vect1 ])).toStrictEqual(vect0_1)
		expect(serializer.makeContinuous([ vect59, vect59 ])).toStrictEqual(vect179_9)
	})

	test('fromString()', () => {
		expect(serializer.fromString('ZZZZZZ')).toStrictEqual(vectm180)
		expect(serializer.fromString('0Z0Z0Z')).toStrictEqual(vect0)
		expect(serializer.fromString('zzzzzz')).toStrictEqual(vect179_9)
	})

	test('toString()', () => {
		expect(serializer.toString(vectm180 )).toBe('ZZZZZZ')
		expect(serializer.toString(vect0    )).toBe('0Z0Z0Z')
		expect(serializer.toString(vect179_9)).toBe('zzzzzz')
	})

	test('round()', () => {
		expect(serializer.round(vectm190)).toStrictEqual(vectm180)
		expect(serializer.round(vect0_1)).toStrictEqual(vect0_1)
		expect(serializer.round(vect180)).toStrictEqual(vect179_9)
	})
})
