export function firstAvailableStudent(students,current='1'){return students.some(s=>s.id===current)?current:students[0]?.id||'';}
export const LANTERN_FLOW_SECONDS=150;
// Equal phases in each lane prevent overtaking, including across the wrap boundary.
export function lanternPhase(index,columns,offset=0){return -((.5+(index%columns)/columns+Math.floor(index/columns)*.035+offset)%1)*LANTERN_FLOW_SECONDS;}
// Stable for the lifetime of a visit, even when the server refreshes the roster.
export function lanternOrder(students,seed){const result=[...students];let state=seed>>>0;for(let i=result.length-1;i>0;i--){state=(Math.imul(state,1664525)+1013904223)>>>0;const j=Math.floor(state/4294967296*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
// Raft anchors use the river's normalized coordinates, not the sprite's top edge.
export function riverLanternLayout(count,height){const columns=Math.max(1,Math.ceil(count/3));const size=Math.max(76,Math.min(140,height*.14));return {columns,size,anchors:[.44,.545,.65],reflectionEnd:.65*height+size*.39};}
