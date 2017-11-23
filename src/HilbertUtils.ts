import * as d3 from 'd3'
import * as d3ScaleChromatic from 'd3-scale-chromatic'
import { getHilbertPath, Point } from './Hilbert'

const margin = { top: 10, right: 10, bottom: 10, left: 10 }

export class HilbertGraph {
  private hilbertSvg: d3.Selection<Element | d3.EnterElement | Document | Window | null, {}, null, undefined>
  private barGraphSvg: d3.Selection<Element | d3.EnterElement | Document | Window | null, {}, null, undefined>

  private length: number
  private size: number

  private lineGroup: d3.Selection<Element | d3.EnterElement | Document | Window | null, {}, null, undefined>
  private graphGroup: d3.Selection<Element | d3.EnterElement | Document | Window | null, {}, null, undefined>

  private points: Point[]
  private activePoint: Point | null

  constructor(
    hilbertSvg: SVGSVGElement,
    barGraphSvg: SVGSVGElement,
    private canvasWidth: number,
    order: number,
    playTone: (frequency: number) => void,
  ) {
    this.length = 1 << order
    this.size = 1 << (order / 2)

    this.hilbertSvg = d3.select(hilbertSvg)
      .attr('width', canvasWidth + margin.left + margin.right)
      .attr('height', canvasWidth + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

    this.barGraphSvg = d3.select(barGraphSvg)
      .attr('width', canvasWidth + margin.left + margin.right)
      .attr('height', canvasWidth + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

    const pixelSize = this.canvasWidth / this.size
    this.graphGroup = this.hilbertSvg.append('g')
      .attr('transform', `translate(${ - pixelSize / 2}, ${ - pixelSize / 2})`)

    this.lineGroup = this.hilbertSvg.append('g')

    this.points = getHilbertPath(0, this.length, this.size)
  }
  public drawLine() {
    const scale = d3.scaleLinear()
      .domain([ 0, this.size ])
      .range([ 0, this.canvasWidth ])

    const line = d3.line<Point>()
      .x((d) => scale(d.x))
      .y((d) => scale(d.y))

    this.lineGroup.append('path')
      .datum(this.points)
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', '1.5')
      .attr('d', line)
  }

  public update(fft: Float32Array) {
    this.updateHilbert(fft)
    this.updateBarGraph(fft)
  }

  public updateHilbert(fft: Float32Array) {
    const scale = d3.scaleLinear()
      .domain([ 0, this.size ])
      .range([ 0, this.canvasWidth ])

    const dBScale = d3.scaleSequential(d3ScaleChromatic.interpolateSpectral)
      .domain([ -30, -100 ])

    const graph = this.graphGroup.selectAll('rect')
      .data(this.points, (d, i, nodes) => d ? (d as Point).id : (nodes[i] as any).id)

    const pixelSize = this.canvasWidth / this.size

    graph.enter().append('rect')
      .attr('x', (d) => scale(d.x))
      .attr('y', (d) => scale(d.y))
      .attr('height', pixelSize)
      .attr('width', pixelSize)
      .attr('stroke', null)
      .on('mouseover', (d, i, nodes) => {
        d3.select(nodes[i])
          // .attr('width', pixelSize * 2)
          // .attr('height', pixelSize * 2)
          .attr('stroke', 'black')
          .attr('stroke-width', '2px')
          // .attr('transform', `translate(${ - pixelSize * 0.5 }, ${ - pixelSize * 0.5})`)
          // .raise()

        this.activePoint = d
      })
      .on('mouseout', (d, i, nodes) => {
        d3.select(nodes[i])
          .attr('stroke', null)
          .attr('stroke-width', null)
          // .attr('width', pixelSize)
          // .attr('height', pixelSize)
          // .attr('transform', null)
          // .attr('stroke', null)

        this.activePoint = null
      })
      .merge(graph)
        .attr('fill', (d, i) => dBScale(fft[d.id]) )
        .attr('stroke', (d) => (this.activePoint && this.activePoint.id === d.id) ? 'black' : null)
        .attr('stroke-width', (d) => (this.activePoint && this.activePoint.id === d.id) ? '2px' : null)

    graph.exit().remove()
  }

  public updateBarGraph(fft: Float32Array) {
    const xScale = d3.scaleLinear()
      .domain([ 0, this.length ])
      .range([ 0, this.canvasWidth ])

    const heightScale = (value: number) => isFinite(value) ?
      d3.scaleLinear()
        .domain([ -100, 0])
        .range([ this.canvasWidth, 0 ])(value) : 0

    const graph = this.barGraphSvg.selectAll('rect')
      .data(this.points, (d, i, nodes) => d ? (d as Point).id : (nodes[i] as any).id)

    const barWidth = this.canvasWidth / this.length

    graph.enter().append('rect')
      .attr('x', (d) => xScale(d.id))
      .attr('y', (d) => heightScale(fft[d.id]))
      .attr('width', barWidth)
      .attr('height', (d) => this.canvasWidth - heightScale(fft[d.id]))
      .attr('fill', (d) => (this.activePoint && this.activePoint.id === d.id) ? 'red' : 'black')
      .on('mouseover', (d) => this.activePoint = d)
      .on('mouseout', (d) => this.activePoint = null)
      .merge(graph)
        .attr('y', (d) => heightScale(fft[d.id]))
        .attr('height', (d) => this.canvasWidth - heightScale(fft[d.id]))

    graph.exit().remove()
  }

}
