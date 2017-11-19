import * as React from 'react'
import * as HilbertUtils from './HilbertUtils'

import './App.css'

class App extends React.Component {

  private svg: SVGSVGElement
  private hilbertGraph: HilbertUtils.HilbertGraph
  private audioContext: AudioContext
  private analyser: AnalyserNode
  private source: MediaStreamAudioSourceNode

  constructor() {
    super()
    this.audioContext = new (window as any).AudioContext()
    this.analyser = this.audioContext.createAnalyser()
  }

  public componentDidMount() {
    this.drawHilbert()
    this.connectAnalyser()
  }

  public componentWillUpdate() {
    return false
  }

  public render() {
    return (
      <div className="App">
        <svg id="hilbert-chart" ref={(svg) => this.svg = svg as SVGSVGElement} />
        <div id="val-tooltip" />
      </div>
    )
  }

  private async getStream() {
    return await navigator.mediaDevices.getUserMedia({ audio: true })
  }

  private async connectAnalyser() {
    this.source = this.audioContext.createMediaStreamSource(await this.getStream())
    this.source.connect(this.analyser)

    this.analyser.fftSize = 32768
    setInterval(() => {
      const buffer = new Float32Array(this.analyser.frequencyBinCount)
      this.analyser.getFloatFrequencyData(buffer)
    }, 100)
  }

  private drawHilbert = () => {
    const order = 12
    const canvasWidth = Math.min(window.innerWidth, window.innerHeight) - 100

    this.hilbertGraph = new HilbertUtils.HilbertGraph(
      this.svg,
      canvasWidth,
      order,
    )
  }

}

export default App
