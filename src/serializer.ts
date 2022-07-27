import * as THREE from 'three'


const ENCODER_STRING = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567'

export const BASE = 60 // must be a multiple of 2


export enum RoundTo {
	NEAREST,
	BOTTOM,
	TOP
}


function roundTo(value: number, round_to: RoundTo) {
	if (round_to == RoundTo.NEAREST) {
		return Math.round(value)
	} else if (round_to == RoundTo.BOTTOM) {
		return Math.floor(value)
	} else {
		return Math.ceil(value)
	}
}


export class SerializationError extends Error {}


abstract class Serializer {
	abstract stringToDiscreteValue(str: string): any
	abstract discreteValueTostring(value: any): string

	abstract discretize(value: any, round_to: RoundTo): any
	abstract makeContinuous(value: any): any

	abstract pack(value: any): any
	abstract unpack(value: any): any

	round(value: number, round_to=RoundTo.NEAREST): number {
		const discrete_value = this.discretize(value, round_to)
		return this.makeContinuous(discrete_value)
	}

	fromString(str: string): number {
		const discrete_value = this.stringToDiscreteValue(str)
		return this.makeContinuous(discrete_value)
	}

	toString(value: number, round_to=RoundTo.NEAREST): string {
		const discrete_value = this.discretize(value, round_to)
		return this.discreteValueTostring(discrete_value)
	}
}


export class NumberSerializer extends Serializer {
	min: number
	max: number
	range: number

	constructor(min: number, max: number) {
		super()
		this.min = min
		this.max = max
		this.range = this.max - this.min
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

	pack(value: number): number {
		const clamped_value = THREE.MathUtils.clamp(value, this.min, this.max)
		return (clamped_value - this.min) / this.range * BASE
	}

	unpack(value: number): number {
		return (value / BASE * this.range) + this.min
	}

	discretize(value: number, round_to=RoundTo.NEAREST): number {
		return roundTo(this.pack(value), round_to)
	}

	makeContinuous(value: number): number {
		return this.unpack(value)
	}
}


type DoubleDiscreteValue = [number, number]

export class DoubleSerializer extends Serializer {
	min: number
	max: number
	range: number

	constructor(min: number, max: number) {
		super()
		this.min = min
		this.max = max
		this.range = this.max - this.min
	}

	stringToDiscreteValue(str: string): DoubleDiscreteValue {
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

	discreteValueTostring(value: DoubleDiscreteValue): string {
		if (value[0] >= BASE || value[1] >= BASE) {
			throw new SerializationError(`Can not convert value ${ value } to string: index overflow.`)
		} else {
			return ENCODER_STRING.charAt(value[0]) + ENCODER_STRING.charAt(value[1])
		}
	}

	pack(value: number): number {
		const clamped_value = THREE.MathUtils.clamp(value, this.min, this.max)
		return (clamped_value - this.min) / this.range * BASE
	}

	unpack(value: number): number {
		return (value / BASE * this.range) + this.min
	}

	discretize(value: number, round_to=RoundTo.NEAREST): DoubleDiscreteValue {
		const packed_value = this.pack(value)
		const high_order_value = Math.floor(packed_value)
		const low_order_value = (packed_value - high_order_value) * BASE

		return [
			roundTo(high_order_value, round_to),
			roundTo(low_order_value, round_to)
		]
	}

	makeContinuous(value: DoubleDiscreteValue): number {
		return this.unpack(value[0]) * BASE + this.unpack(value[1])
	}

}
