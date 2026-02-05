"use client"
import { signIn , signOut, useSession} from "next-auth/react";


export function Appbar(){
    const session = useSession();
    console.log(session);
    return (
        <div className="flex justify-between p-2 bg-black" >
           <div className="flex justify-between text-4xl font-bold text-white">MUZZIFY</div>
           <div>
            {session.data?.user ? <button className="m-2 p-2 bg-blue-400 rounded-lg text-lg font-semibold text-white" onClick={()=> signOut()}>Sign out</button> :   <button className="m-2 p-2 bg-blue-400 rounded-lg text-lg font-semibold text-white" onClick={()=> signIn()}>Sign in</button>}
          
           </div>
        </div>
        
    )
}