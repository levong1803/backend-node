import https from 'https';

https.get('https://google.com', (res) => {
  const dateStr = res.headers.date;
  const realTime = new Date(dateStr).getTime();
  const sysTime = Date.now();
  console.log("Real Time:", new Date(realTime).toISOString());
  console.log("System Time:", new Date(sysTime).toISOString());
  console.log("Offset (Real - System):", realTime - sysTime);
});
