import * as React from 'react'
import * as HilbertUtils from './HilbertUtils'

import './App.css'

const ORDER = 11

class App extends React.Component {

  private svg: SVGSVGElement
  private hilbertGraph: HilbertUtils.HilbertGraph
  private audioContext: AudioContext
  private analyser: AnalyserNode
  private source: MediaStreamAudioSourceNode

  private oscillator: OscillatorNode

  constructor() {
    super()
    this.audioContext = new (window as any).AudioContext()
    this.analyser = this.audioContext.createAnalyser()
  }

  public componentDidMount() {
    this.setup()
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

  private async setup() {
    await this.setupWebAudio()
    this.drawHilbert()
  }

  private async setupWebAudio() {
    this.source = this.audioContext.createMediaStreamSource(await this.getStream())
    this.source.connect(this.analyser)

    this.analyser.fftSize = 2 << ORDER
    this.analyser.smoothingTimeConstant = 0.3

    this.oscillator = this.audioContext.createOscillator()
    this.oscillator.connect(this.audioContext.destination)

    setInterval(() => {
      const buffer = new Float32Array(this.analyser.frequencyBinCount)
      this.analyser.getFloatFrequencyData(buffer)
      this.hilbertGraph.update(buffer)
    }, 10)
  }

  private drawHilbert = () => {
    const canvasWidth = Math.min(window.innerWidth, window.innerHeight) - 20

    this.hilbertGraph = new HilbertUtils.HilbertGraph(
      this.svg,
      canvasWidth,
      ORDER,
      (frequency: number) => {
        this.oscillator.disconnect()
        this.oscillator = this.audioContext.createOscillator()

        if (frequency === 0) {
          return
        }

        this.oscillator.frequency.value = frequency
        this.oscillator.connect(this.audioContext.destination)
        this.oscillator.start()
      },
    )

    this.hilbertGraph.drawLine()
  }

}

export default App
