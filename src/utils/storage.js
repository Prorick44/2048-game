export const getBest = () => +localStorage.getItem("best") || 0;
export const setBest = (s) => localStorage.setItem("best", s);
