import {getChatGPTUser} from "../../chatgpt-auth";
import {query} from "../../../lib/database";
import {readJSON,workspaceSchema} from "../../../lib/validation";
const headers={"Cache-Control":"no-store"};
export async function GET(){
 if(!process.env.DATABASE_URL)return Response.json({mode:"local",data:null},{headers});
 const user=await getChatGPTUser();if(!user)return Response.json({error:"Sign in to load your workspace."},{status:401,headers});
 try{const rows=await query("SELECT data FROM dwell_workspaces WHERE user_id = $1",[user.userId]);return Response.json({mode:"postgres",data:rows[0]?.data||null},{headers});}catch{return Response.json({mode:"local",data:null,error:"Cloud storage unavailable. Browser storage is active."},{status:503,headers});}
}
export async function PUT(request:Request){
 if(!process.env.DATABASE_URL)return Response.json({mode:"local"},{headers});
 const user=await getChatGPTUser();if(!user)return Response.json({error:"Sign in to save your workspace."},{status:401,headers});
 const origin=request.headers.get("origin");if(origin&&origin!==new URL(request.url).origin)return Response.json({error:"Invalid origin"},{status:403,headers});
 let data;try{data=workspaceSchema.parse(await readJSON(request));}catch{return Response.json({error:"Invalid workspace data."},{status:400,headers});}
 try{await query("INSERT INTO dwell_workspaces (user_id, data) VALUES ($1, $2::jsonb) ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()",[user.userId,JSON.stringify(data)]);return Response.json({mode:"postgres",saved:true},{headers});}catch{return Response.json({error:"Cloud save failed."},{status:503,headers});}
}
