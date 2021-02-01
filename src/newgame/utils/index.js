import { TILE } from "@/newgame/constants/Overworld";
 
const positionToRealWorld = position => position * TILE.SIZE;

export { positionToRealWorld };