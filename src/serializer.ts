import * as THREE from 'three'


const ENCODER_STRING = 'ZYXWVUTSRQPONMLKJIHGFEDCBA75310246abcdefghijklmnopqrstuvwxyz'

export const BASE = 60


export class SerializationError extends Error {}


function pack(value: number, min: number, max: number): number {
	return (value - min) / (max - min) * BASE
}

function unpack(value: number, min: number, max: number): number {
	return (value / BASE * (max - min)) + min
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
	epsilon: number

	constructor(min: number, max: number) {
		super()
		this.min = min
		this.max = max
		this.epsilon = (max - min) / BASE
	}

	round = (value: number): number => super.round(value)
	fromString = (str: string): number => super.fromString(str)
	toString = (value: number): string => super.toString(value)

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
		const discrete_value = Math.floor(pack(value, this.min, this.max))
		return THREE.MathUtils.clamp(discrete_value, 0, BASE - 1)
	}

	makeContinuous(value: number): number {
		const continuous_value = unpack(value, this.min, this.max)
		return THREE.MathUtils.clamp(continuous_value, this.min, this.max - this.epsilon)
	}
}


export type DiscreteValueDoublePrecision = [ number, number ]

export class NumberSerializerDoublePrecision extends Serializer {
	min: number
	max: number
	epsilon: number

	constructor(min: number, max: number) {
		super()
		this.min = min
		this.max = max
		this.epsilon = (max - min) / (BASE * BASE)

	}

	round = (value: number): number => super.round(value)
	fromString = (str: string): number => super.fromString(str)
	toString = (value: number): string => super.toString(value)

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
		const packed_high_order = pack(value, this.min, this.max)
		const high_order = THREE.MathUtils.clamp(Math.floor(packed_high_order), 0, BASE - 1)
		const packed_low_order = (packed_high_order - high_order) * ( BASE + 1)
		const low_order = THREE.MathUtils.clamp(Math.floor(packed_low_order), 0, BASE - 1)

		return [ high_order, low_order ]
	}

	makeContinuous(value: DiscreteValueDoublePrecision): number {
		const high_order = unpack(value[0], this.min, this.max)
		const low_order = unpack(value[1], 0, ( this.max - this.min ) / BASE)
		return high_order + low_order
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

	round = (vector: THREE.Vector3): THREE.Vector3 => super.round(vector)
	fromString = (str: string): THREE.Vector3 => super.fromString(str)
	toString = (vector: THREE.Vector3): string => super.toString(vector)

	stringToDiscreteValue(str: string): THREE.Vector3 {
		return new THREE.Vector3(
			this.serializer_x.stringToDiscreteValue(str[0]),
			this.serializer_y.stringToDiscreteValue(str[1]),
			this.serializer_z.stringToDiscreteValue(str[2])
		)
	}

	discreteValueTostring(vector: THREE.Vector3): string {
		return this.serializer_x.discreteValueTostring(vector.x)
			+  this.serializer_y.discreteValueTostring(vector.y)
			+  this.serializer_z.discreteValueTostring(vector.z)
	}

	discretize(vector: THREE.Vector3): THREE.Vector3 {
		return new THREE.Vector3(
			this.serializer_x.discretize(vector.x),
			this.serializer_y.discretize(vector.y),
			this.serializer_z.discretize(vector.z)
		)
	}

	makeContinuous(vector: THREE.Vector3): THREE.Vector3 {
		return new THREE.Vector3(
			this.serializer_x.makeContinuous(vector.x),
			this.serializer_y.makeContinuous(vector.y),
			this.serializer_z.makeContinuous(vector.z)
		)
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

	round = (vector: THREE.Vector3): THREE.Vector3 => super.round(vector)
	fromString = (str: string): THREE.Vector3 => super.fromString(str)
	toString = (vector: THREE.Vector3): string => super.toString(vector)

	stringToDiscreteValue(str: string): DiscreteVector3DoublePrecision {
		const discrete_x = this.serializer_x.stringToDiscreteValue(str.substring(0, 2))
		const discrete_y = this.serializer_y.stringToDiscreteValue(str.substring(2, 4))
		const discrete_z = this.serializer_z.stringToDiscreteValue(str.substring(4, 6))

		return [
			new THREE.Vector3(discrete_x[0], discrete_y[0], discrete_z[0]),
			new THREE.Vector3(discrete_x[1], discrete_y[1], discrete_z[1])
		]
	}

	discreteValueTostring(vector: DiscreteVector3DoublePrecision): string {
		return this.serializer_x.discreteValueTostring([ vector[0].x, vector[1].x ])
			+  this.serializer_y.discreteValueTostring([ vector[0].y, vector[1].y ])
			+  this.serializer_z.discreteValueTostring([ vector[0].z, vector[1].z ])
	}

	discretize(vector: THREE.Vector3): DiscreteVector3DoublePrecision {
		const discrete_x = this.serializer_x.discretize(vector.x)
		const discrete_y = this.serializer_y.discretize(vector.y)
		const discrete_z = this.serializer_z.discretize(vector.z)

		return [
			new THREE.Vector3(discrete_x[0], discrete_y[0], discrete_z[0]),
			new THREE.Vector3(discrete_x[1], discrete_y[1], discrete_z[1])
		]
	}

	makeContinuous(vector: DiscreteVector3DoublePrecision): THREE.Vector3 {
		return new THREE.Vector3(
			this.serializer_x.makeContinuous([ vector[0].x, vector[1].x ]),
			this.serializer_y.makeContinuous([ vector[0].y, vector[1].y ]),
			this.serializer_z.makeContinuous([ vector[0].z, vector[1].z ])
		)
	}
}
