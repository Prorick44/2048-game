export const initBoard = () => {
  let b = Array(4).fill(0).map(()=>Array(4).fill(0));
  const rand = () => {
    let empty=[];
    b.forEach((r,i)=>r.forEach((c,j)=>!c&&empty.push({i,j})));
    let {i,j}=empty[Math.floor(Math.random()*empty.length)];
    b[i][j]=Math.random()<0.9?2:4;
  };
  rand(); rand();
  return b;
};