import * as _ from 'lodash'

export enum XDirections {
  Left = 0,
  Right = 1,
}

export enum YDirections {
  Up = 0,
  Down = 1,
}

export type Point = {
  x: number,
  y: number,
}

export function rotate(
  coords: { x: number; y: number },
  regionSize: number,
  xDirection: XDirections,
  yDirection: YDirections,
) {
  if (yDirection === YDirections.Down) {
    return coords
  }

  // rotate top right qudrant CW 90 deg
  if (xDirection === XDirections.Right) {
    return {
      x: regionSize - 1 - coords.y,
      y: regionSize - 1 - coords.x,
    }
    // rotate top left quadrant CCW 90deg
  } else {
    return {
      x: coords.y,
      y: coords.x,
    }
  }
}

// Note: this function will start breaking down for n > 2^26 (MAX_SAFE_INTEGER = 2^53)
export function pointToDistance(point: Point, sideSize: number): number {
  const bitLength = Math.floor(Math.log2(sideSize))

  return _.range(1, bitLength + 1)
    .reduce(({ distance, rotatedPoint }, shiftCount) => {
      const quadrantBoundaryCoord = sideSize >> shiftCount

      const xDirection = (rotatedPoint.y & quadrantBoundaryCoord) > 0 ? XDirections.Right : XDirections.Left
      const yDirection = (rotatedPoint.x & quadrantBoundaryCoord) > 0 ? YDirections.Down : YDirections.Up

      const newDistance = distance + ((quadrantBoundaryCoord * quadrantBoundaryCoord * (3 * xDirection)) ^ yDirection)
      const newPoint = rotate(rotatedPoint, quadrantBoundaryCoord, xDirection, yDirection)

      return {
        distance: newDistance,
        rotatedPoint: newPoint,
      }
    }, {
      distance: 0,
      rotatedPoint: point,
    }).distance
}

// Every 4 bits can be rotated and decoded into a U shape. 00->01 = down, 01->10 = right, 10 -> 11 = up
export function distanceToPoint(distance: number, regionSize: number): Point {
  const bitLength = Math.floor(Math.log2(regionSize))

  return  _.range(0, bitLength)
    .reduce(({ subDistance, point }, shiftCount) => {
      const regionSize = 1 << shiftCount

      const xDirection = 1 & (subDistance >> 1) ? XDirections.Right : XDirections.Left
      const yDirection = 1 & (subDistance ^ xDirection) ? YDirections.Down : YDirections.Up

      const { x, y } = rotate(point, regionSize, xDirection, yDirection)

      return {
        subDistance: subDistance >> 2,
        point: {
          x: x + regionSize * xDirection,
          y: y + regionSize * yDirection,
        },
      }
    },
    {
      subDistance: distance,
      point: { x: 0, y: 0 },
    }).point
}

export class HilbertCurve {
  public path: any
  // Note: Maximum safe order is 26, due to JS numbers upper-boundary of 53 bits
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
  constructor(
    public order: number,
    public canvasWidth: number,
  ) {
  }

  public layout(range: { start: number; length: number }) {
    this.path = getHilbertPath(
      range.start,
      range.length,
      this.order,
      this.canvasWidth,
    )

    return this.path
  }

  public getDistance(point: Point) {
    const n = 1 << this.order

    const scale = (coord: number) => Math.floor(coord * n / this.canvasWidth)

    const scaledPoint: Point = {
      x: scale(point.x),
      y: scale(point.y),
    }

    return pointToDistance(scaledPoint, n)
  }
}

export function getHilbertPath(start: number, length: number, order: number, canvasSize: number) {
  // const maxPos = 4 << (2 * order)
  // if (start > maxPos || start < 0) {
  //   throw new Error('Start exceeds maximum or minimum position')
  // } else if (length > maxPos || length < 0) {
  //   throw new Error('Length exceeds maximum or minimum position ')
  // }

  const sideSize = 1 << (order / 2)
  const cellWidth = canvasSize / sideSize

  const startPoint = distanceToPoint(start, sideSize)
  const vertices = []

  let prevPoint = startPoint
  let nextPoint: Point

  for (let i = 1; i < length; i++) {
    nextPoint = distanceToPoint(start + i, sideSize)

    vertices.push(
      nextPoint.x > prevPoint.x ? 'R' : (
        nextPoint.x < prevPoint.x ? 'L' : (
          nextPoint.y > prevPoint.y ? 'D' : 'U'
        )
      ),
    )

    prevPoint = nextPoint
  }

  return {
    cellWidth,
    startPoint,
    pathVertices: vertices,
  }
}
