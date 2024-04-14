export function getDistance(v1: Vector3Mp, v2: Vector3Mp) {
  const x = v2.x - v1.x;
  const y = v2.y - v1.y;

  return Math.abs(Math.hypot(x, y));
}

export function xyInFrontOfPos(pos: Vector3Mp, heading: number, dist: number) {
  heading *= Math.PI / 180;
  pos.x += dist * Math.sin(-heading);
  pos.y += dist * Math.cos(-heading);
  return pos;
}
