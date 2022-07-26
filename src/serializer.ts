import * as THREE from 'three'


const ENCODER_STRING = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567'

export const BASE = 60 // must be a multiple of 2


export class SerializationError extends Error {}


export enum RoundTo {
	NEAREST,
	BOTTOM,
	TOP
}


export class ValueSerializer {
	min: number
	max: number
	range: number

	constructor(min: number, max: number) {
		this.min = min
		this.max = max
		this.range = this.max - this.min
	}

	fromString(str: string): number {
		if (str.length == 1) {
			return this.makeContinuous(this.#charToInt(str))
		} else if (str.length == 2) {
			return this.makeContinuousDouble(this.#charToInt(str[0]), this.#charToInt(str[1]))
		} else {
			throw new SerializationError(`String length must be equal to 1 or 2 but is ${ str.length }.`)
		}
	}

	toString(value: number, double_precision: boolean): string {
		if (double_precision) {
			const [ ho_discrete_value, lo_discrete_value] = this.discretizeDouble(value)
			return this.#intToChar(ho_discrete_value) + this.#intToChar(lo_discrete_value)
		} else {
			const discrete_value = this.discretize(value)
			return this.#intToChar(discrete_value)
		}
	}

	discretize(value: number, round_to=RoundTo.NEAREST): number {
		const packed_value = this.#pack(value)

		return this.#roundTo(packed_value, round_to)
	}

	discretizeDouble(value: number, round_to=RoundTo.NEAREST): [number, number] {
		const packed_value = this.#pack(value)
		const high_order_value = Math.floor(packed_value)
		const low_order_value = (packed_value - high_order_value) * BASE

		return [
			this.#roundTo(high_order_value, round_to),
			this.#roundTo(low_order_value, round_to)
		]
	}

	makeContinuous(value: number): number {
		return this.#unpack(value)
	}

	makeContinuousDouble(high_order_value: number, low_order_value: number): number {
		return this.#unpack(high_order_value) * BASE + this.#unpack(low_order_value)
	}

	round(value: number, round_to=RoundTo.NEAREST): number {
		const discrete_value = this.discretize(value, round_to)
		return this.makeContinuous(discrete_value)
	}

	roundDouble(value: number, round_to=RoundTo.NEAREST): number {
		const [ ho_discrete_value, lo_discrete_value] = this.discretizeDouble(value, round_to)
		return this.makeContinuousDouble(ho_discrete_value, lo_discrete_value)
	}

	#roundTo(value: number, round_to: RoundTo) {
		if (round_to == RoundTo.NEAREST) {
			return Math.round(value)
		} else if (round_to == RoundTo.BOTTOM) {
			return Math.floor(value)
		} else {
			return Math.ceil(value)
		}
	}

	#pack(value: number) {
		const clamped_value = THREE.MathUtils.clamp(value, this.min, this.max)
		return (clamped_value - this.min) / this.range * BASE
	}

	#unpack(value: number) {
		return (value / BASE * this.range) + this.min
	}

	#intToChar(value: number) {
		if (value >= BASE) {
			throw new SerializationError(`Can not convert value ${ value } to string: index overflow.`)
		} else {
			return ENCODER_STRING.charAt(value)
		}
	}

	#charToInt(str: string) {
		const position = ENCODER_STRING.indexOf(str)
		if (position == -1) {
			throw new SerializationError(`Can not convert string '${ str }' to value: unrecognized char.`)
		} else {
			return position
		}
	}
}
