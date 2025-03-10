import Papa from "papaparse"

export async function fetchAndParseCSV(url: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const csvText = await response.text()

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          resolve(results.data)
        },
        error: (error) => {
          reject(error)
        },
      })
    })
  } catch (error) {
    console.error("Error fetching or parsing CSV:", error)
    throw error
  }
}

export function exportToCSV(data: any[]): string {
  return Papa.unparse(data)
}

export function importFromCSV(csvData: string): any[] {
  const results = Papa.parse(csvData, {
    header: true,
    dynamicTyping: true,
  })
  return results.data
}
