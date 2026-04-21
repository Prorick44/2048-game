const slide=r=>r.filter(x=>x);
const merge=(r,s)=>{
  for(let i=0;i<r.length-1;i++){
    if(r[i]===r[i+1]){
      r[i]*=2;
      s.score+=r[i];
      r[i+1]=0;
    }
  }
  return r;
};
const operate=(r,s)=>{
  r=slide(r); r=merge(r,s); r=slide(r);
  while(r.length<4) r.push(0);
  return r;
};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

export const left=(b,s)=>{
  let nb=b.map(r=>operate(r,s));
  return eq(b,nb)?b:add(nb);
};
export const right=(b,s)=>{
  let nb=b.map(r=>operate([...r].reverse(),s).reverse());
  return eq(b,nb)?b:add(nb);
};
export const up=(b,s)=>{
  let t=b[0].map((_,i)=>b.map(r=>r[i]));
  let m=t.map(r=>operate(r,s));
  let nb=m[0].map((_,i)=>m.map(r=>r[i]));
  return eq(b,nb)?b:add(nb);
};
export const down=(b,s)=>{
  let t=b[0].map((_,i)=>b.map(r=>r[i]));
  let m=t.map(r=>operate([...r].reverse(),s).reverse());
  let nb=m[0].map((_,i)=>m.map(r=>r[i]));
  return eq(b,nb)?b:add(nb);
};

const add=(b)=>{
  let empty=[];
  b.forEach((r,i)=>r.forEach((c,j)=>!c&&empty.push({i,j})));
  if(!empty.length) return b;
  let {i,j}=empty[Math.floor(Math.random()*empty.length)];
  let nb=b.map(r=>[...r]);
  nb[i][j]=Math.random()<0.9?2:4;
  return nb;
};

export const gameOver=b=>{
  for(let i=0;i<4;i++)
    for(let j=0;j<4;j++){
      if(!b[i][j]) return false;
      if(j<3&&b[i][j]===b[i][j+1]) return false;
      if(i<3&&b[i][j]===b[i+1][j]) return false;
    }
  return true;
};

export const win=b=>b.flat().includes(2048);