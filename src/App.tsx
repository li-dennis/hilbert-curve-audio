import * as d3 from 'd3'
import * as React from 'react'
import * as HilbertUtils from './HilbertUtils'

import './App.css'

class App extends React.Component {

  private svg: SVGSVGElement

  public drawHilbert = () => {
    const svg = d3.select(this.svg)
    const canvasWidth = Math.min(window.innerWidth, window.innerHeight - 100)
    const order = 10000

    HilbertUtils.init(svg, canvasWidth, order)
  }

  public componentDidMount() {
    this.drawHilbert()
  }

  public componentDidUpdate() {
    this.drawHilbert()
  }

  public componentWillUpdate() {
    return false
  }

  public render() {
    return (
      <div className="App">
        <svg id="hilbert-chart" ref={(svg) => this.svg = svg as SVGSVGElement} />
      </div>
    )
  }
}

export default App
