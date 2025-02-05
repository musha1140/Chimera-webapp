"use server"

import { sql } from "@vercel/postgres"
import { revalidatePath } from "next/cache"
import type { Tower } from "@/lib/types"

export async function getTowers() {
  try {
    const { rows } = await sql`
      SELECT * FROM towers
      ORDER BY created_at DESC
    `
    return rows as Tower[]
  } catch (error) {
    console.error("Error:", error)
    return []
  }
}

export async function addTower(tower: Omit<Tower, "id">) {
  try {
    const { rows } = await sql`
      INSERT INTO towers (name, buff, description, members, contest)
      VALUES (${tower.name}, ${tower.buff}, ${tower.description}, ${JSON.stringify(tower.members)}, ${JSON.stringify(tower.contest)})
      RETURNING *
    `
    revalidatePath("/towers")
    return rows[0] as Tower
  } catch (error) {
    console.error("Error:", error)
    throw new Error("Failed to add tower")
  }
}

export async function updateTower(id: string, tower: Partial<Tower>) {
  try {
    const { rows } = await sql`
      UPDATE towers
      SET 
        members = COALESCE(${JSON.stringify(tower.members)}, members),
        contest = COALESCE(${JSON.stringify(tower.contest)}, contest)
      WHERE id = ${id}
      RETURNING *
    `
    revalidatePath("/towers")
    return rows[0] as Tower
  } catch (error) {
    console.error("Error:", error)
    throw new Error("Failed to update tower")
  }
}

export async function deleteTower(id: string) {
  try {
    await sql`
      DELETE FROM towers
      WHERE id = ${id}
    `
    revalidatePath("/towers")
  } catch (error) {
    console.error("Error:", error)
    throw new Error("Failed to delete tower")
  }
}

