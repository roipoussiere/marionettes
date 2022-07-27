import * as THREE from 'three'
import * as Serializer from '../src/serializer'


describe('Testing NumberSerializer', () => {
	const serializer = new Serializer.NumberSerializer(-180, 180)

	test('stringToDiscreteValue()', () => {
		expect(serializer.stringToDiscreteValue('A')).toBe(0)
		expect(serializer.stringToDiscreteValue('e')).toBe(30)
		expect(serializer.stringToDiscreteValue('7')).toBe(59)
	})

	test('discreteValueTostring()', () => {
		expect(serializer.discreteValueTostring(0)).toBe('A')
		expect(serializer.discreteValueTostring(30)).toBe('e')
		expect(serializer.discreteValueTostring(59)).toBe('7')
	})

	test('discretize()', () => {
		expect(serializer.discretize(-180)).toBe(0)
		expect(serializer.discretize(0)).toBe(30)
		expect(serializer.discretize(180)).toBe(59)
	})

	test('makeContinuous()', () => {
		expect(serializer.makeContinuous(0)).toBe(-180)
		expect(serializer.makeContinuous(30)).toBe(0)
		expect(serializer.makeContinuous(59)).toBe(180)
	})

	test('fromString()', () => {
		expect(serializer.fromString('A')).toBe(-180)
		expect(serializer.fromString('e')).toBe(0)
		expect(serializer.fromString('7')).toBe(180)
	})

	test('toString()', () => {
		expect(serializer.toString(-180)).toBe('A')
		expect(serializer.toString(0)).toBe('e')
		expect(serializer.toString(180)).toBe('7')
	})

	test('round()', () => {
		expect(serializer.round(-190)).toBe(-180)
		expect(serializer.round(0.2)).toBe(0)
		expect(serializer.round(190)).toBe(180)
	})
})


describe('Testing NumberSerializerDoublePrecision', () => {
	const serializer = new Serializer.NumberSerializerDoublePrecision(-180, 180)

	test('stringToDiscreteValue()', () => {
		expect(serializer.stringToDiscreteValue('AA')).toBe([ 0, 0 ])
		expect(serializer.stringToDiscreteValue('ee')).toBe([ 30, 30 ])
		expect(serializer.stringToDiscreteValue('77')).toBe([ 59, 59 ])
	})

	test('discreteValueTostring()', () => {
		expect(serializer.discreteValueTostring([ 0, 0 ])).toBe('AA')
		expect(serializer.discreteValueTostring([ 30, 30 ])).toBe('ee')
		expect(serializer.discreteValueTostring([ 59, 59 ])).toBe('77')
	})

	test('discretize()', () => {
		expect(serializer.discretize(-180)).toBe([ 0, 0 ])
		expect(serializer.discretize(0)).toBe([ 30, 30 ])
		expect(serializer.discretize(180)).toBe([ 59, 59 ])
	})

	test('makeContinuous()', () => {
		expect(serializer.makeContinuous([ 0, 0 ])).toBe(-180)
		expect(serializer.makeContinuous([ 30, 30 ])).toBe(0)
		expect(serializer.makeContinuous([ 59, 59 ])).toBe(180)
	})

	test('fromString()', () => {
		expect(serializer.fromString('AA')).toBe(-180)
		expect(serializer.fromString('ee')).toBe(0)
		expect(serializer.fromString('77')).toBe(180)
	})

	test('toString()', () => {
		expect(serializer.toString(-180)).toBe('AA')
		expect(serializer.toString(0)).toBe('ee')
		expect(serializer.toString(180)).toBe('77')
	})

	test('round()', () => {
		expect(serializer.round(-190)).toBe(-180)
		expect(serializer.round(0.1)).toBe(0)
		expect(serializer.round(190)).toBe(180)
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
		expect(serializer.stringToDiscreteValue('AAA')).toStrictEqual(vect0)
		expect(serializer.stringToDiscreteValue('eee')).toStrictEqual(vect30)
		expect(serializer.stringToDiscreteValue('777')).toStrictEqual(vect60)
	})

	test('discreteValueTostring()', () => {
		expect(serializer.discreteValueTostring(vect0)).toBe('AAA')
		expect(serializer.discreteValueTostring(vect30)).toBe('eee')
		expect(serializer.discreteValueTostring(vect60)).toBe('777')
	})

	test('discretize()', () => {
		expect(serializer.discretize(vectm180)).toBe([ 0, 0 ])
		expect(serializer.discretize(vect0)).toBe([ 30, 30 ])
		expect(serializer.discretize(vect180)).toBe([ 59, 59 ])
	})

	test('makeContinuous()', () => {
		expect(serializer.makeContinuous(vect0)).toStrictEqual(vectm180)
		expect(serializer.makeContinuous(vect30)).toStrictEqual(vect0)
		expect(serializer.makeContinuous(vect60)).toStrictEqual(vect180)
	})

	test('fromString()', () => {
		expect(serializer.fromString('AAA')).toStrictEqual(vectm180)
		expect(serializer.fromString('eee')).toStrictEqual(vect0)
		expect(serializer.fromString('777')).toStrictEqual(vect180)
	})

	test('toString()', () => {
		expect(serializer.toString(vectm180)).toBe('AAA')
		expect(serializer.toString(vect0)).toBe('eee')
		expect(serializer.toString(vect180)).toBe('777')
	})

	test('round()', () => {
		expect(serializer.round(new THREE.Vector3(-190, -190, -190))).toBe(vectm180)
		expect(serializer.round(new THREE.Vector3(0.1, 0.1, 0.1))).toBe(vect0)
		expect(serializer.round(new THREE.Vector3(190, 190, 190))).toBe(vect180)
	})
})


describe('Testing Vector3Serializer', () => {
	const serializer = new Serializer.Vector3SerializerDoublePrecision(vectm180, vect180)

	test('stringToDiscreteValue()', () => {
		expect(serializer.stringToDiscreteValue('AAAAAA')).toStrictEqual([ vect0, vect0 ])
		expect(serializer.stringToDiscreteValue('eeeeee')).toStrictEqual([ vect30, vect30 ])
		expect(serializer.stringToDiscreteValue('777777')).toStrictEqual([ vect60, vect60 ])
	})

	test('discreteValueTostring()', () => {
		expect(serializer.discreteValueTostring([ vect0, vect0 ])).toBe('AAAAAA')
		expect(serializer.discreteValueTostring([ vect30, vect30 ])).toBe('eeeeee')
		expect(serializer.discreteValueTostring([ vect60, vect60 ])).toBe('777777')
	})

	test('discretize()', () => {
		expect(serializer.discretize(vectm180)).toBe([ 0, 0 ])
		expect(serializer.discretize(vect0)).toBe([ 30, 30 ])
		expect(serializer.discretize(vect180)).toBe([ 59, 59 ])
	})

	test('makeContinuous()', () => {
		expect(serializer.makeContinuous([ vect0, vect0 ])).toStrictEqual(vectm180)
		expect(serializer.makeContinuous([ vect30, vect30 ])).toStrictEqual(vect0)
		expect(serializer.makeContinuous([ vect60, vect60 ])).toStrictEqual(vect180)
	})

	test('fromString()', () => {
		expect(serializer.fromString('AAAAAA')).toStrictEqual(vectm180)
		expect(serializer.fromString('eeeeee')).toStrictEqual(vect0)
		expect(serializer.fromString('777777')).toStrictEqual(vect180)
	})

	test('toString()', () => {
		expect(serializer.toString(vectm180)).toBe('AAAAAA')
		expect(serializer.toString(vect0)).toBe('eeeeee')
		expect(serializer.toString(vect180)).toBe('777777')
	})

	test('round()', () => {
		expect(serializer.round(new THREE.Vector3(-190, -190, -190))).toBe(vectm180)
		expect(serializer.round(new THREE.Vector3(0.1, 0.1, 0.1))).toBe(vect0)
		expect(serializer.round(new THREE.Vector3(190, 190, 190))).toBe(vect180)
	})
})
