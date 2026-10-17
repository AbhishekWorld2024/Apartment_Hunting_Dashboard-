// Neon PostgreSQL uses HTTPS, compatible with both Next.js and the Sites Worker runtime.
export async function query(sql:string,params:unknown[]=[]){
 const connection=process.env.DATABASE_URL;if(!connection)throw new Error("Database not configured");
 const url=new URL(connection);if(!url.hostname.endsWith(".neon.tech"))throw new Error("Use a Neon PostgreSQL connection string for the HTTPS adapter");
 const response=await fetch(`https://${url.hostname.replace(/^[^.]+\./,"api.")}/sql`,{method:"POST",signal:AbortSignal.timeout(12000),headers:{"Content-Type":"application/json","Neon-Connection-String":connection,"Neon-Raw-Text-Output":"false","Neon-Array-Mode":"false"},body:JSON.stringify({query:sql,params})});
 if(!response.ok)throw new Error("Database request failed");return (await response.json() as {rows:Record<string,unknown>[]}).rows;
}
