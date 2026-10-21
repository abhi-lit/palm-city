const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert');
const elements={},noop=()=>{},ctx=new Proxy({},{get:()=>noop});
function element(){return{style:{},getContext:()=>ctx,getBoundingClientRect:()=>({width:1100,height:640}),setAttribute:noop,addEventListener:noop}}
const sandbox={document:{querySelector:s=>elements[s]??=element(),querySelectorAll:()=>[],addEventListener:noop},window:{addEventListener:noop},ResizeObserver:class{observe(){}},requestAnimationFrame:noop,devicePixelRatio:1,assert};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(__dirname+'/../game.js','utf8'),sandbox);
vm.runInContext(`
start(); const oldY=player.y;keys.add('w');update(.1);keys.clear();assert(player.y<oldY,'Walking advances player');
enterExit();assert(car,'Nearby parked car can be entered');const oldCarY=car.y;keys.add('w');for(let i=0;i<60;i++)update(1/60);keys.clear();assert(car.y<oldCarY,'Car accelerates');
keys.add(' ');for(let i=0;i<120;i++)update(1/60);keys.clear();assert(Math.abs(car.speed)<2,'Braking stops car');enterExit();assert(!car,'Can exit stopped car');
assert(blocked(buildings[0].x+10,buildings[0].y+10,9),'Building collisions');assert(blocked(2200,500,9),'Water boundary');
start(true);for(let i=0;i<3600;i++)update(1/60);assert.equal(mission,3,'Autoplay completes all deliveries');assert.equal(cash,2250,'Rewards total 2250');
pause();assert.equal(mode,'paused');const frozenX=car.x;update(1);assert.equal(car.x,frozenX);start();assert.equal(mode,'playing');
start(false);assert.equal(mission,0);assert.equal(cash,0);assert.equal(car,null);assert.equal(tour,false);
render();
`,sandbox);
console.log('PASS: walking, enter/exit, acceleration, braking, boundaries, all 3 missions, rewards, pause/resume, reset, rendering.');
