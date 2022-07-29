import * as THREE from 'three'
import * as Serializer from '../src/serializer'


describe('Testing NumberSerializer', () => {
	const serializer = new Serializer.NumberSerializer(-180, 180)

	test('stringToDiscreteValue()', () => {
		expect(serializer.stringToDiscreteValue('Z')).toBe(0)
		expect(serializer.stringToDiscreteValue('0')).toBe(30)
		expect(serializer.stringToDiscreteValue('z')).toBe(60)
	})

	test('discreteValueTostring()', () => {
		expect(serializer.discreteValueTostring(0 )).toBe('Z')
		expect(serializer.discreteValueTostring(30)).toBe('0')
		expect(serializer.discreteValueTostring(60)).toBe('z')
	})

	test('discretize()', () => {
		expect(serializer.discretize(-180)).toBe(0)
		expect(serializer.discretize( 0  )).toBe(30)
		expect(serializer.discretize( 180)).toBe(60)
	})

	test('makeContinuous()', () => {
		expect(serializer.makeContinuous(0 )).toBe(-180)
		expect(serializer.makeContinuous(30)).toBe(0)
		expect(serializer.makeContinuous(60)).toBe(180)
	})

	test('fromString()', () => {
		expect(serializer.fromString('Z')).toBe(-180)
		expect(serializer.fromString('0')).toBe(0)
		expect(serializer.fromString('z')).toBe(180)
	})

	test('toString()', () => {
		expect(serializer.toString(-180)).toBe('Z')
		expect(serializer.toString( 0  )).toBe('0')
		expect(serializer.toString( 180)).toBe('z')
	})

	test('round()', () => {
		expect(serializer.round(-190)).toBe(-180)
		expect(serializer.round( 0.2)).toBe(0)
		expect(serializer.round( 190)).toBe(180)
	})
})


describe('Testing NumberSerializerDoublePrecision', () => {
	const serializer = new Serializer.NumberSerializerDoublePrecision(-180, 180)

	test('stringToDiscreteValue()', () => {
		expect(serializer.stringToDiscreteValue('ZZ')).toStrictEqual([ 0 , 0  ])
		expect(serializer.stringToDiscreteValue('00')).toStrictEqual([ 30, 30 ])
		expect(serializer.stringToDiscreteValue('zz')).toStrictEqual([ 60, 60 ])
	})

	test('discreteValueTostring()', () => {
		expect(serializer.discreteValueTostring([ 0 , 0  ])).toBe('ZZ')
		expect(serializer.discreteValueTostring([ 30, 30 ])).toBe('00')
		expect(serializer.discreteValueTostring([ 60, 60 ])).toBe('zz')
	})

	test('discretize()', () => {
		expect(serializer.discretize(-180)).toStrictEqual([ 0 , 30 ])
		expect(serializer.discretize( 0  )).toStrictEqual([ 30, 30 ])
		expect(serializer.discretize( 180)).toStrictEqual([ 60, 30 ])
	})

	test('makeContinuous()', () => {
		expect(serializer.makeContinuous([ 0 , 30 ])).toBe(-180)
		expect(serializer.makeContinuous([ 30, 30 ])).toBe(0)
		expect(serializer.makeContinuous([ 60, 30 ])).toBe(180)

		expect(serializer.makeContinuous([ 29, 60 ])).toBe(-3)
		expect(serializer.makeContinuous([ 30, 0 ])).toBe(-3)
	})

	test('fromString()', () => {
		expect(serializer.fromString('Z0')).toBe(-180)
		expect(serializer.fromString('00')).toBe(0)
		expect(serializer.fromString('z0')).toBe(180)
	})

	test('toString()', () => {
		expect(serializer.toString(-180)).toBe('Z0')
		expect(serializer.toString( 0  )).toBe('00')
		expect(serializer.toString( 180)).toBe('z0')
	})

	test('round()', () => {
		expect(serializer.round(-190)).toBe(-180)
		expect(serializer.round( 0.1)).toBe(0.1)
		expect(serializer.round( 190)).toBe(180)
	})
})


const vect0 = new THREE.Vector3(0, 0, 0)
const vect30 = new THREE.Vector3(30, 30, 30)
const vect60 = new THREE.Vector3(60, 60, 60)
const vectm180 = new THREE.Vector3(-180, -180, -180)
const vect180 = new THREE.Vector3(180, 180, 180)


describe('Testing Vector3Serializer', () => {
	const serializer = new Serializer.Vector3Serializer(vectm180, vect180)

	test('stringToDiscreteValue()', () => {
		expect(serializer.stringToDiscreteValue('ZZZ')).toStrictEqual(vect0)
		expect(serializer.stringToDiscreteValue('000')).toStrictEqual(vect30)
		expect(serializer.stringToDiscreteValue('zzz')).toStrictEqual(vect60)
	})

	test('discreteValueTostring()', () => {
		expect(serializer.discreteValueTostring(vect0 )).toBe('ZZZ')
		expect(serializer.discreteValueTostring(vect30)).toBe('000')
		expect(serializer.discreteValueTostring(vect60)).toBe('zzz')
	})

	test('discretize()', () => {
		expect(serializer.discretize(vectm180)).toStrictEqual(vect0)
		expect(serializer.discretize(vect0   )).toStrictEqual(vect30)
		expect(serializer.discretize(vect180 )).toStrictEqual(vect60)
	})

	test('makeContinuous()', () => {
		expect(serializer.makeContinuous(vect0 )).toStrictEqual(vectm180)
		expect(serializer.makeContinuous(vect30)).toStrictEqual(vect0)
		expect(serializer.makeContinuous(vect60)).toStrictEqual(vect180)
	})

	test('fromString()', () => {
		expect(serializer.fromString('ZZZ')).toStrictEqual(vectm180)
		expect(serializer.fromString('000')).toStrictEqual(vect0)
		expect(serializer.fromString('zzz')).toStrictEqual(vect180)
	})

	test('toString()', () => {
		expect(serializer.toString(vectm180)).toBe('ZZZ')
		expect(serializer.toString(vect0   )).toBe('000')
		expect(serializer.toString(vect180 )).toBe('zzz')
	})

	test('round()', () => {
		expect(serializer.round(new THREE.Vector3(-190, -190, -190))).toStrictEqual(vectm180)
		expect(serializer.round(new THREE.Vector3( 0.1,  0.1,  0.1))).toStrictEqual(vect0)
		expect(serializer.round(new THREE.Vector3( 190,  190,  190))).toStrictEqual(vect180)
	})
})


describe('Testing Vector3SerializerDoublePrecision', () => {
	const serializer = new Serializer.Vector3SerializerDoublePrecision(vectm180, vect180)

	test('stringToDiscreteValue()', () => {
		expect(serializer.stringToDiscreteValue('ZZZZZZ')).toStrictEqual([ vect0 , vect0  ])
		expect(serializer.stringToDiscreteValue('000000')).toStrictEqual([ vect30, vect30 ])
		expect(serializer.stringToDiscreteValue('zzzzzz')).toStrictEqual([ vect60, vect60 ])
	})

	test('discreteValueTostring()', () => {
		expect(serializer.discreteValueTostring([ vect0 , vect0  ])).toBe('ZZZZZZ')
		expect(serializer.discreteValueTostring([ vect30, vect30 ])).toBe('000000')
		expect(serializer.discreteValueTostring([ vect60, vect60 ])).toBe('zzzzzz')
	})

	test('discretize()', () => {
		expect(serializer.discretize(vectm180)).toStrictEqual([ vect0 , vect30 ])
		expect(serializer.discretize(vect0   )).toStrictEqual([ vect30, vect30 ])
		expect(serializer.discretize(vect180 )).toStrictEqual([ vect60, vect30 ])
	})

	test('makeContinuous()', () => {
		expect(serializer.makeContinuous([ vect0 , vect30  ])).toStrictEqual(vectm180)
		expect(serializer.makeContinuous([ vect30, vect30 ])).toStrictEqual(vect0)
		expect(serializer.makeContinuous([ vect60, vect30 ])).toStrictEqual(vect180)
	})

	test('fromString()', () => {
		expect(serializer.fromString('Z0Z0Z0')).toStrictEqual(vectm180)
		expect(serializer.fromString('000000')).toStrictEqual(vect0)
		expect(serializer.fromString('z0z0z0')).toStrictEqual(vect180)
	})

	test('toString()', () => {
		expect(serializer.toString(vectm180)).toBe('Z0Z0Z0')
		expect(serializer.toString(vect0   )).toBe('000000')
		expect(serializer.toString(vect180 )).toBe('z0z0z0')
	})

	test('round()', () => {
		expect(serializer.round(new THREE.Vector3(-190, -190, -190))).toStrictEqual(vectm180)
		expect(serializer.round(new THREE.Vector3( 0.1,  0.1,  0.1))).toStrictEqual(new THREE.Vector3( 0.1,  0.1,  0.1))
		expect(serializer.round(new THREE.Vector3( 190,  190,  190))).toStrictEqual(vect180)
	})
})
