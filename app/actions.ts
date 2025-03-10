"use server"

import { sql } from "@vercel/postgres"
import { revalidatePath } from "next/cache"
import { Resend } from "resend"
import type { ShadowWar, Tower, Member } from "@/lib/types"
import { exportToCSV, importFromCSV } from "@/utils/csvParser"
import { exportToPNG, importFromPNG } from "@/utils/imageParser"
import { JWT } from "google-auth-library"
import { GoogleSpreadsheet } from "google-spreadsheet"
import * as googleServiceAccountPrivateKey from "./google-service-account-privatekey.json"

const resend = new Resend("re_ZHfcThLv_PgEgPPVk3peuaPB67zQ3Nyyn")

const GOOGLE_SPREAD_SHEET_DOCUMENT_ID = "1EVsyjDkw5ni4d0EA-pNHhb99FS369eSMjzaazEKq9c4"

// Add the getMembers function
export async function getMembers(): Promise<Member[]> {
  try {
    // First, try to create the table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        class VARCHAR(255) NOT NULL,
        cr INTEGER,
        resonance INTEGER,
        level INTEGER,
        is_ready BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Now fetch the members
    const { rows } = await sql`
      SELECT * FROM members
      ORDER BY name ASC
    `
    return rows as Member[]
  } catch (error) {
    console.error("Error fetching or creating members table:", error)
    return []
  }
}

// Add function to add a new member
export async function addMember(member: Omit<Member, "id">): Promise<Member> {
  try {
    const { rows } = await sql`
      INSERT INTO members (name, class, cr, resonance, level, is_ready)
      VALUES (${member.name}, ${member.class}, ${member.cr}, ${member.resonance}, ${member.level}, ${member.isReady})
      RETURNING *
    `
    revalidatePath("/members")
    return rows[0] as Member
  } catch (error) {
    console.error("Error adding member:", error)
    throw new Error("Failed to add member")
  }
}

// Add function to update a member
export async function updateMember(id: number, member: Partial<Member>): Promise<Member> {
  try {
    const { rows } = await sql`
      UPDATE members
      SET 
        name = COALESCE(${member.name}, name),
        class = COALESCE(${member.class}, class),
        cr = COALESCE(${member.cr}, cr),
        resonance = COALESCE(${member.resonance}, resonance),
        level = COALESCE(${member.level}, level),
        is_ready = COALESCE(${member.isReady}, is_ready)
      WHERE id = ${id}
      RETURNING *
    `
    revalidatePath("/members")
    return rows[0] as Member
  } catch (error) {
    console.error("Error updating member:", error)
    throw new Error("Failed to update member")
  }
}

// Add function to delete a member
export async function deleteMember(id: number): Promise<void> {
  try {
    await sql`
      DELETE FROM members
      WHERE id = ${id}
    `
    revalidatePath("/members")
  } catch (error) {
    console.error("Error deleting member:", error)
    throw new Error("Failed to delete member")
  }
}

// Add the missing addTower function
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

// Add getTowers function
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

// Add updateTower function
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

// Add deleteTower function
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

// Add the missing function
export async function getLatestShadowWarSnapshot(): Promise<ShadowWar | null> {
  try {
    const { rows } = await sql`
      SELECT war_data
      FROM shadow_war_snapshots
      ORDER BY snapshot_date DESC
      LIMIT 1
    `
    return rows[0]?.war_data || null
  } catch (error) {
    console.error("Error fetching latest snapshot:", error)
    return null
  }
}

// Add the missing function for getting snapshot by date
export async function getShadowWarSnapshotByDate(date: Date): Promise<ShadowWar | null> {
  try {
    const { rows } = await sql`
      SELECT war_data
      FROM shadow_war_snapshots
      WHERE DATE(snapshot_date) = DATE(${date})
      ORDER BY snapshot_date DESC
      LIMIT 1
    `
    return rows[0]?.war_data || null
  } catch (error) {
    console.error("Error fetching snapshot by date:", error)
    return null
  }
}

// Add the missing function for saving snapshots
export async function saveShadowWarSnapshot(warData: ShadowWar) {
  try {
    await sql`
      INSERT INTO shadow_war_snapshots (snapshot_date, war_data)
      VALUES (CURRENT_TIMESTAMP, ${JSON.stringify(warData)})
    `
    return true
  } catch (error) {
    console.error("Error saving snapshot:", error)
    throw new Error("Failed to save snapshot")
  }
}

// Add the missing function for updating shadow war data
export async function updateShadowWar(warData: ShadowWar) {
  try {
    await sql`
      INSERT INTO shadow_war_snapshots (snapshot_date, war_data)
      VALUES (CURRENT_TIMESTAMP, ${JSON.stringify(warData)})
    `
    return true
  } catch (error) {
    console.error("Error updating shadow war:", error)
    throw new Error("Failed to update shadow war")
  }
}

// Add the missing function for updating player ready status
export async function updatePlayerReadyStatus(
  warTypeIndex: number,
  matchIndex: number,
  playerIndex: number,
  isReady: boolean,
): Promise<ShadowWar> {
  try {
    const latestSnapshot = await getLatestShadowWarSnapshot()
    if (!latestSnapshot) {
      throw new Error("No snapshot found")
    }

    const updatedSnapshot = { ...latestSnapshot }
    updatedSnapshot.warTypes[warTypeIndex].matches[matchIndex].players[playerIndex].isReady = isReady

    await saveShadowWarSnapshot(updatedSnapshot)
    return updatedSnapshot
  } catch (error) {
    console.error("Error updating player ready status:", error)
    throw new Error("Failed to update player ready status")
  }
}

export async function submitApplication(formData: FormData) {
  const name = formData.get("name") as string
  const battleTag = formData.get("battleTag") as string
  const characterClass = formData.get("class") as string
  const cr = formData.get("cr") as string
  const resonance = formData.get("resonance") as string
  const level = formData.get("level") as string
  const experience = formData.get("experience") as string
  const availability = formData.get("availability") as string

  const emailBody = `
    New Chimera Clan Application:
    
    Name: ${name}
    Battle Tag: ${battleTag}
    Class: ${characterClass}
    Combat Rating (CR): ${cr}
    Resonance: ${resonance}
    Level: ${level}
    Previous Clan Experience: ${experience}
    Availability for Clan Activities: ${availability}
  `

  try {
    await resend.emails.send({
      from: "Chimera Clan <applications@chimera.com>",
      to: "musha1140@gmail.com",
      subject: `Chimera Clan Application - ${name}`,
      text: emailBody,
    })

    return { success: true, message: "Application submitted successfully!" }
  } catch (error) {
    console.error("Failed to send email:", error)
    return { success: false, message: "Failed to submit application. Please try again." }
  }
}

export async function initializeDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        class VARCHAR(255) NOT NULL,
        cr INTEGER,
        resonance INTEGER,
        level INTEGER,
        is_ready BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS towers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        buff TEXT,
        description TEXT,
        members JSONB,
        contest JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS shadow_war_snapshots (
        id SERIAL PRIMARY KEY,
        snapshot_date TIMESTAMP WITH TIME ZONE NOT NULL,
        war_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Error initializing database:", error)
  }
}

// Add a new function to export members data to a CSV file
export async function exportMembersToCSV(): Promise<string> {
  try {
    const members = await getMembers()
    const csvData = exportToCSV(members)
    return csvData
  } catch (error) {
    console.error("Error exporting members to CSV:", error)
    throw new Error("Failed to export members to CSV")
  }
}

// Add a new function to export members data to a PNG file
export async function exportMembersToPNG(): Promise<Buffer> {
  try {
    const members = await getMembers()
    const pngData = await exportToPNG(members)
    return pngData
  } catch (error) {
    console.error("Error exporting members to PNG:", error)
    throw new Error("Failed to export members to PNG")
  }
}

// Add a new function to import members data from a CSV file
export async function importMembersFromCSV(csvData: string): Promise<void> {
  try {
    const members = importFromCSV(csvData)
    for (const member of members) {
      await addMember(member)
    }
  } catch (error) {
    console.error("Error importing members from CSV:", error)
    throw new Error("Failed to import members from CSV")
  }
}

// Add a new function to import members data from a PNG file
export async function importMembersFromPNG(pngData: Buffer): Promise<void> {
  try {
    const members = await importFromPNG(pngData)
    for (const member of members) {
      await addMember(member)
    }
  } catch (error) {
    console.error("Error importing members from PNG:", error)
    throw new Error("Failed to import members from PNG")
  }
}

// Add a new function to fetch members data from Google Sheets
export async function getMembersFromGoogleSheetsRoster(): Promise<any[]> {
  console.log("Loading roster from Google Drive...")
  const serviceAccountAuth = new JWT({
    email: googleServiceAccountPrivateKey.client_email,
    key: googleServiceAccountPrivateKey.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })
  const doc = new GoogleSpreadsheet(GOOGLE_SPREAD_SHEET_DOCUMENT_ID, serviceAccountAuth)
  await doc.loadInfo()

  const worksheet = doc.sheetsByTitle["Clan Roster"]
  const rows = await worksheet.getRows()

  const memberData = rows.map((row) => ({
    name: row["Member Name"],
    class: row["Class"],
    cr: row["CR"],
    resonance: row["Resonance"],
    level: row["Level"],
    isReady: row["Is Ready"] === "TRUE",
  }))

  return memberData
}
