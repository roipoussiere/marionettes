import * as THREE from 'three'


const ENCODER_STRING = 'ZYXWVUTSRQPONMLKJIHGFEDCBA753102468abcdefghijklmnopqrstuvwxyz'

export const BASE = 61


export class SerializationError extends Error {}


function pack(value: number, min: number, max: number): number {
	const clamped_value = THREE.MathUtils.clamp(value, min, max)
	return (clamped_value - min) / (max - min) * (BASE - 1)
}

function unpack(value: number, min: number, max: number): number {
	return (value / (BASE - 1) * (max - min)) + min
}


export abstract class Serializer {
	abstract stringToDiscreteValue(str: string): any
	abstract discreteValueTostring(value: any): string

	abstract discretize(value: any): any
	abstract makeContinuous(value: any): any

	round(value: any): any {
		const discrete_value = this.discretize(value)
		return this.makeContinuous(discrete_value)
	}

	fromString(str: string): any {
		const discrete_value = this.stringToDiscreteValue(str)
		return this.makeContinuous(discrete_value)
	}

	toString(value: any): string {
		const discrete_value = this.discretize(value)
		return this.discreteValueTostring(discrete_value)
	}
}


export class NumberSerializer extends Serializer {
	min: number
	max: number

	constructor(min: number, max: number) {
		super()
		this.min = min
		this.max = max
	}

	stringToDiscreteValue(str: string): number {
		if (str.length != 1) {
			throw new SerializationError(`String length must be equal to 1 but is ${ str.length }.`)
		}

		const position = ENCODER_STRING.indexOf(str)
		if (position == -1) {
			throw new SerializationError(`Can not convert string '${ str }' to value: unrecognized char.`)
		} else {
			return position
		}	
	}

	discreteValueTostring(value: number): string {
		if (value >= BASE) {
			throw new SerializationError(`Can not convert value ${ value } to string: index overflow.`)
		} else {
			return ENCODER_STRING.charAt(value)
		}
	}

	discretize(value: number): number {
		return Math.round(pack(value, this.min, this.max))
	}

	makeContinuous(value: number): number {
		return unpack(value, this.min, this.max)
	}

	round(value: number): number {
		return super.round(value)
	}

	fromString(str: string): number {
		return super.fromString(str)
	}

	toString(value: number): string {
		return super.toString(value)
	}
}


export type DiscreteValueDoublePrecision = [ number, number ]

export class NumberSerializerDoublePrecision extends Serializer {
	min: number
	max: number
	range: number

	constructor(min: number, max: number) {
		super()
		this.min = min
		this.max = max
		this.range = this.max - this.min
	}

	stringToDiscreteValue(str: string): DiscreteValueDoublePrecision {
		if (str.length != 2) {
			throw new SerializationError(`String length must be equal to 2 but is ${ str.length }.`)
		}

		const high_order_value = ENCODER_STRING.indexOf(str[0])
		const low_order_value = ENCODER_STRING.indexOf(str[1])

		if (high_order_value == -1 || low_order_value == -1) {
			throw new SerializationError(`Can not convert string '${ str }' to value: unrecognized char.`)
		} else {
			return [ high_order_value, low_order_value ]
		}	
	}

	discreteValueTostring(value: DiscreteValueDoublePrecision): string {
		if (value[0] >= BASE || value[1] >= BASE) {
			throw new SerializationError(`Can not convert value ${ value } to string: index overflow.`)
		} else {
			return ENCODER_STRING.charAt(value[0]) + ENCODER_STRING.charAt(value[1])
		}
	}

	discretize(value: number): DiscreteValueDoublePrecision {
		const packed_value = pack(value, this.min, this.max)
		const high_order_value = Math.floor(packed_value)
		const low_order_value = Math.floor((packed_value - high_order_value) * BASE)

		return [ high_order_value, low_order_value ]
	}

	makeContinuous(value: DiscreteValueDoublePrecision): number {
		return unpack(value[0], this.min, this.max) * BASE + unpack(value[1], this.min, this.max)
	}

	round(value: number): number {
		return super.round(value)
	}

	fromString(str: string): number {
		return super.fromString(str)
	}

	toString(value: number): string {
		return super.toString(value)
	}
}


export class Vector3Serializer extends Serializer {
	serializer_x: NumberSerializer
	serializer_y: NumberSerializer
	serializer_z: NumberSerializer

	constructor(min: THREE.Vector3, max: THREE.Vector3) {
		super()
		this.serializer_x = new NumberSerializer(min.x, max.x)
		this.serializer_y = new NumberSerializer(min.y, max.y)
		this.serializer_z = new NumberSerializer(min.z, max.z)
	}

	stringToDiscreteValue(str: string): THREE.Vector3 {
		return new THREE.Vector3(
			this.serializer_x.stringToDiscreteValue(str[0]),
			this.serializer_y.stringToDiscreteValue(str[1]),
			this.serializer_z.stringToDiscreteValue(str[2])
		)
	}

	discreteValueTostring(value: THREE.Vector3): string {
		return this.serializer_x.discreteValueTostring(value.x)
			+  this.serializer_y.discreteValueTostring(value.y)
			+  this.serializer_z.discreteValueTostring(value.z)
	}

	discretize(value: THREE.Vector3): THREE.Vector3 {
		return new THREE.Vector3(
			this.serializer_x.discretize(value.x),
			this.serializer_y.discretize(value.y),
			this.serializer_z.discretize(value.z)
		)
	}

	makeContinuous(value: THREE.Vector3): THREE.Vector3 {
		return new THREE.Vector3(
			this.serializer_x.makeContinuous(value.x),
			this.serializer_y.makeContinuous(value.y),
			this.serializer_z.makeContinuous(value.z)
		)
	}

	round(value: THREE.Vector3): THREE.Vector3 {
		return super.round(value)
	}

	fromString(str: string): THREE.Vector3 {
		return super.fromString(str)
	}

	toString(value: THREE.Vector3): string {
		return super.toString(value)
	}
}


export type DiscreteVector3DoublePrecision = [ THREE.Vector3, THREE.Vector3 ]

export class Vector3SerializerDoublePrecision extends Serializer {
	serializer_x: NumberSerializerDoublePrecision
	serializer_y: NumberSerializerDoublePrecision
	serializer_z: NumberSerializerDoublePrecision

	constructor(min: THREE.Vector3, max: THREE.Vector3) {
		super()

		this.serializer_x = new NumberSerializerDoublePrecision(min.x, max.x)
		this.serializer_y = new NumberSerializerDoublePrecision(min.y, max.y)
		this.serializer_z = new NumberSerializerDoublePrecision(min.z, max.z)
	}

	stringToDiscreteValue(str: string): DiscreteVector3DoublePrecision {
		const discrete_x = this.serializer_x.stringToDiscreteValue(str.substring(0, 2))
		const discrete_y = this.serializer_y.stringToDiscreteValue(str.substring(2, 4))
		const discrete_z = this.serializer_z.stringToDiscreteValue(str.substring(4, 6))

		return [
			new THREE.Vector3(discrete_x[0], discrete_y[0], discrete_z[0]),
			new THREE.Vector3(discrete_x[1], discrete_y[1], discrete_z[1])
		]
	}

	discreteValueTostring(value: DiscreteVector3DoublePrecision): string {
		return this.serializer_x.discreteValueTostring([ value[0].x, value[1].x ])
			+  this.serializer_y.discreteValueTostring([ value[0].y, value[1].y ])
			+  this.serializer_z.discreteValueTostring([ value[0].z, value[1].z ])
	}

	discretize(value: THREE.Vector3): DiscreteVector3DoublePrecision {
		const discrete_x = this.serializer_x.discretize(value.x)
		const discrete_y = this.serializer_y.discretize(value.y)
		const discrete_z = this.serializer_z.discretize(value.z)

		return [
			new THREE.Vector3(discrete_x[0], discrete_y[0], discrete_z[0]),
			new THREE.Vector3(discrete_x[1], discrete_y[1], discrete_z[1])
		]
	}

	makeContinuous(value: DiscreteVector3DoublePrecision): THREE.Vector3 {
		return new THREE.Vector3(
			this.serializer_x.makeContinuous([ value[0].x, value[1].x ]),
			this.serializer_y.makeContinuous([ value[0].y, value[1].y ]),
			this.serializer_z.makeContinuous([ value[0].z, value[1].z ])
		)
	}

	round(value: THREE.Vector3): THREE.Vector3 {
		return super.round(value)
	}

	fromString(str: string): THREE.Vector3 {
		return super.fromString(str)
	}

	toString(value: THREE.Vector3): string {
		return super.toString(value)
	}
}
