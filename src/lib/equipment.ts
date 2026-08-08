import type { Spot } from '../types/spot'


export type EquipmentOption = {
  name: string
  count: number
}

export function getEquipmentOptions(spots: Spot[]): EquipmentOption[] {
  const counts: Record<string, number> = {}

  for (const spot of spots) {
    for (const equipment of spot.equipment) {
      counts[equipment] = (counts[equipment] ?? 0) + 1
    }
  }

  return Object.entries(counts).map(([name, count]) => ({
    name,
    count,
  }))
}

// Former un moule pour faire afficher les filtres, utiliser les maths, les if, combinaisons de if comme if choiceUserFilter1 + choiceUSerFilter2 + choiceUserFilter3 = something -> Faire la recherche, afficher ce qu'il y a, sous ofrme de liste ou de spots directement sur la map (bouton liste toujours viable) button onclick open menu donc le menu est d'abord en false puis en true, il est ouvert il donne sur tout les filtres, on cree un check a cote de chaque equipements, et sur le bouton rechercher on mettra aussi le nombre de spot correspondant genre afficher les spots correspondants (x) / rechercher (x).