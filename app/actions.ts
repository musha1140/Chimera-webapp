"use server"

import { sql } from "@vercel/postgres"
import { revalidatePath } from "next/cache"
import type { Tower, Member, ShadowWar } from "@/lib/types"

async function ensureTablesExist() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS towers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        buff TEXT NOT NULL,
        description TEXT,
        members JSONB DEFAULT '[]',
        contest JSONB DEFAULT '{"isContested": false}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("Towers table created or already exists")
  } catch (error) {
    console.error("Error creating towers table:", error)
  }
}

// Towers actions
export async function getTowers() {
  try {
    await ensureTablesExist()
    const { rows } = await sql`SELECT * FROM towers ORDER BY created_at DESC`
    return rows as Tower[]
  } catch (error) {
    console.error("Error:", error)
    return []
  }
}

export async function addTower(tower: Omit<Tower, "id">) {
  try {
    await ensureTablesExist()
    const { rows } = await sql`
      INSERT INTO towers (name, buff, description, members, contest)
      VALUES (${tower.name}, ${tower.buff}, ${tower.description}, ${JSON.stringify(tower.members)}, ${JSON.stringify(tower.contest)})
      RETURNING *
    `
    revalidatePath("/towers")
    return rows[0] as Tower
  } catch (error) {
    console.error("Error adding tower:", error)
    throw new Error("Failed to add tower: " + (error instanceof Error ? error.message : String(error)))
  }
}

export async function updateTower(id: string, tower: Partial<Tower>) {
  try {
    await ensureTablesExist()
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
    console.error("Error updating tower:", error)
    throw new Error("Failed to update tower: " + (error instanceof Error ? error.message : String(error)))
  }
}

export async function deleteTower(id: string) {
  try {
    await ensureTablesExist()
    await sql`DELETE FROM towers WHERE id = ${id}`
    revalidatePath("/towers")
  } catch (error) {
    console.error("Error deleting tower:", error)
    throw new Error("Failed to delete tower: " + (error instanceof Error ? error.message : String(error)))
  }
}

// Members actions
export async function getMembers() {
  try {
    const { rows } = await sql`SELECT * FROM members ORDER BY name ASC`
    return rows as Member[]
  } catch (error) {
    console.error("Error:", error)
    return []
  }
}

export async function updateMemberReadyStatus(id: string, isReady: boolean) {
  try {
    const { rows } = await sql`
      UPDATE members
      SET is_ready = ${isReady}
      WHERE id = ${id}
      RETURNING *
    `
    revalidatePath("/members")
    return rows[0] as Member
  } catch (error) {
    console.error("Error:", error)
    throw new Error("Failed to update member status")
  }
}

// Shadow War actions
export async function getShadowWar() {
  try {
    const { rows } = await sql`SELECT * FROM shadow_wars ORDER BY created_at DESC LIMIT 1`
    return rows[0] as ShadowWar
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

export async function updateShadowWar(shadowWar: ShadowWar) {
  try {
    const { rows } = await sql`
      INSERT INTO shadow_wars (war_time, war_types)
      VALUES (${shadowWar.warTime}, ${JSON.stringify(shadowWar.warTypes)})
      ON CONFLICT (id) DO UPDATE
      SET war_time = EXCLUDED.war_time, war_types = EXCLUDED.war_types
      RETURNING *
    `
    revalidatePath("/shadow")
    return rows[0] as ShadowWar
  } catch (error) {
    console.error("Error:", error)
    throw new Error("Failed to update Shadow War")
  }
}

