import { useState, useEffect } from "react"
import { getTrain, prepareLines, prepareStationNames } from '../api.js'

import './style.css'
import carIcon from '../assets/car-icon.png'

function Main() {

  const [trains, setTrains] = useState([])
  const [lines, setLines] = useState({})
  const [stations, setStations] = useState({})
  const [filter, setFilter] = useState({
    carCount: {},
    line: {},
    type: {},
  })

  useEffect( () => {
    async function updateTrain() {
      const newTrains = await getTrain()
      setTrains(newTrains)
    }

    async function prepareData() {
      const lineMap = await prepareLines()
      setLines(lineMap)
      setStations(await prepareStationNames())
      const lineFilter = Object.keys(lineMap).reduce((result, key) => {
        result[key] = true
        return result
      }, {})
      setFilter({
        carCount: {
          0: true,
          4: true,
          6: true,
          8: true,
        },
        line: {
          null: true,
          ...lineFilter,
        },
        type: {
          "Unknown": true,
          "NoPassengers": true,
          "Normal": true,
          "Special": true,
        }
      })
    }
    prepareData()
    updateTrain()

    const updateTrainInterval = setInterval(updateTrain, 1000)
    
    return () => clearInterval(updateTrainInterval)
  }, [])

  const visibilityByFilter = (train) => {
    const { carCount, line, type } = filter
    return carCount[train.CarCount] && line[train.LineCode] && type[train.ServiceType]
  }

  const toggleFilter = (type, value) => {
    let oldFilter = filter
    oldFilter[type][value] = !filter[type][value]
    setFilter(oldFilter)
  }

  return (
    <div style={{
      margin: '0 40px', 
      overflowY: "hidden",
    }}>
      <div className="filterheader">
        <div className="title">Filter By</div>
        <div className="subfilter">
          <div className="subtitle">Car Count</div>
          <div className="labels">
          {
            Object.keys(filter.carCount).map((c) => 
              <label key={c}>
                <input type="checkbox"
                onChange={() => toggleFilter("carCount", c)}
                checked={filter.carCount[c]}/>
                { c === "0" ? "(No data)" : c }
              </label>
            )
          }
          </div>
        </div>
        <div className="subfilter">
          <div className="subtitle">Line</div>
          <div className="labels">
          {
            Object.keys(filter.line).map((c) => 
              <label key={c}>
                <input type="checkbox"
                onChange={() => toggleFilter("line", c)}
                checked={filter.line[c]}/>
                <span
                style={{
                  // backgroundColor: lines[c] || "White",
                  // color: c === "BL" && "White",
                  borderLeft: `solid 20px ${lines[c]}`,
                  padding: "0 3px",
                }}>
                { c === "null" ? "(No data)" : lines[c] }
                </span>
              </label>
            )
          }
          </div>
        </div>
        <div className="subfilter">
          <div className="subtitle">Service Type</div>
          <div className="labels">
          {
            Object.keys(filter.type).map((c) => 
              <label key={c} className={c}>
                <input type="checkbox"
                onChange={() => toggleFilter("type", c)}
                checked={filter.type[c]}
                />
                {c}
              </label>
            )
          }
          </div>
        </div>
      </div>
      <div className="scrollcontainer">
        <table>
          <thead>
          <tr>
            <th>Train ID</th>
            <th>Train Number</th>
            <th>Car Count</th>
            <th>Direction</th>
            <th>Circuit ID</th>
            <th>Destination Station</th>
            <th>Line</th>
            <th>Seconds at Location</th>
            <th>Service Type</th>
          </tr>
          </thead>
          <tbody>
          {
            trains.filter(visibilityByFilter).map((train) => {
                return (
                  <tr key={train.TrainId}>
                    <td>{train.TrainId}</td>
                    <td>{train.TrainNumber}</td>
                    {
                      train.CarCount === 0 ?
                      <td>(No data)</td> : 
                      <td style={{ textAlign: "left" }}>
                        <span style={{ margin: "0 10px" }}>
                        {train.CarCount}
                        </span>
                        {[...Array(train.CarCount)].map((_, i) => (
                          <img
                          src={carIcon}
                          alt="car icon"
                          key={i}/>
                        ))}
                        
                      </td>
                    }
                    <td>
                      {train.DirectionNum === 1 && "northbound / eastbound"}
                      {train.DirectionNum === 2 && "southbound / westbound"}
                    </td>
                    <td>{train.CircuitId}</td>
                    <td>{stations[train.DestinationStationCode] || "(No data)"}</td>
                    <td
                    style={{
                      // backgroundColor: lines[train.LineCode] || "White",
                      // color: train.LineCode === "BL" && "White"
                      borderLeft: `solid 15px ${lines[train.LineCode] || "rgba(0,0,0,0.0)"}`
                    }}>{lines[train.LineCode] || "(No data)"}</td>
                    <td>{train.SecondsAtLocation}</td>
                    <td className={train.ServiceType}>{train.ServiceType}</td>
                  </tr>
                )
                })
          }
          
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Main;
