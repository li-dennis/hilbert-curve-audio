import * as React from 'react'
import * as HilbertUtils from './HilbertUtils'

import './App.css'

class App extends React.Component {

  private canvas: HTMLCanvasElement
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
        <canvas id="hilbert-chart" ref={(canvas) => this.canvas = canvas as HTMLCanvasElement}/>
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
    const canvasWidth = Math.min(window.innerWidth, window.innerHeight)
    this.canvas.width = canvasWidth
    this.canvas.height = canvasWidth

    this.hilbertGraph = new HilbertUtils.HilbertGraph(
      this.canvas.getContext('2d') as CanvasRenderingContext2D,
      canvasWidth,
      order,
    )
  }

}

export default App
