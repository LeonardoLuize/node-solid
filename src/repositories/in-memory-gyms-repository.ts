
import { getDistanceBetweenCoordinates } from "@/utils/get-distance-between-coordinates"
import { Gym, Prisma } from "@prisma/client"
import { Decimal } from "@prisma/client/runtime"
import { randomUUID } from "crypto"
import { FindManyNearbyParams, GymsRepository } from "./gyms-repository"

export class InMemoryGymsRepository implements GymsRepository {
	public items: Gym[] = []

	async findById(gymId: string): Promise<Gym | null> {
		const gym = this.items.find(item => item.id === gymId)

		if(!gym){
			return null
		}

		return gym
	}

	async findManyNearby({ latitude, longitude }: FindManyNearbyParams) {
		return this.items.filter(item => {
			const distance = getDistanceBetweenCoordinates(
				{latitude, longitude},
				{latitude: item.latitude.toNumber(), longitude: item.longitude.toNumber()}
			)

			return distance < 10
		})
	}

	async searchMany(query: string, page: number): Promise<Gym[]> {
		return this.items.filter(item => item.title.includes(query)).slice((page -1) * 20, page * 20)
	}

	async create(data: Prisma.GymCreateInput){
		const gym = {
			id: data.id ?? randomUUID(),
			title: data.title,
			description: data.description ?? null,
			phone: data.phone ?? null,
			latitude: new Decimal(data.latitude.toString()),
			longitude: new Decimal(data.longitude.toString())
		}

		this.items.push(gym)

		return gym
	}
}