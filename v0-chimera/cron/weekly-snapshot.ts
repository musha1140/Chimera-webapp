import { saveShadowWarSnapshot } from "../app/actions"
import { getLatestShadowWarSnapshot } from "../app/actions"

async function weeklySnapshot() {
  try {
    const latestSnapshot = await getLatestShadowWarSnapshot()
    if (latestSnapshot) {
      await saveShadowWarSnapshot(latestSnapshot)
      console.log("Weekly snapshot saved successfully")
    } else {
      console.log("No snapshot data available to save")
    }
  } catch (error) {
    console.error("Error saving weekly snapshot:", error)
  }
}

weeklySnapshot()

