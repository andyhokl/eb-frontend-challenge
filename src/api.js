const train_url = process.env.REACT_APP_TRAIN_URL || ""
const station_url = process.env.REACT_APP_STATION_URL || ""
const line_url = process.env.REACT_APP_LINE_URL || ""
const api_key = process.env.REACT_APP_API_KEY || ""

export async function getData(url) {
  try {
    const resp = await fetch(url, {
      headers: {
        api_key
      },
    })
    try {
      return await resp.json()
    } catch (e) {
      alert("unable to decode json")
      console.log(e.message)
      console.log(e.stack)
      return {}
    }
  } catch (e) {
    alert("unable to fetch data")
    console.log(e.message)
    console.log(e.stack)
    return {}
  }
}

export async function getTrain() {
  const { TrainPositions } = await getData(train_url)
  return TrainPositions
}

export async function prepareLines() {
  let lineMap = {}
  const { Lines } = await getData(line_url)
  Lines.forEach(line => {
    const { LineCode, DisplayName } = line
    lineMap[LineCode] = DisplayName
  })
  return lineMap
}

export async function prepareStationNames() {
  let stationNames = {}
  const { Stations } = await getData(station_url)
  Stations.forEach(station => {
    const { Code, Name } = station
    stationNames[Code] = Name
  })
  return stationNames
}