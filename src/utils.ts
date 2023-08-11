import { createActor, canisterId as backend_id } from './declarations/backend';
import { canisterId as internet_identity_id } from './declarations/internet_identity';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { HttpAgent, Identity } from '@dfinity/agent';

type ResultGetPrincipal = Identity | undefined;

export async function getIdentity(): Promise<ResultGetPrincipal> {
    const motokoblocks_principal = Principal.fromText(backend_id);
    
        let errorInRegister: boolean = false;
        let urlProvider: string;
    
        const authClient = await AuthClient.create();
    
        switch (process.env.DFX_NETWORK) {
            case ("ic"):
                urlProvider = `https://${internet_identity_id}.ic0.app`;
            default:
                urlProvider = `http://${internet_identity_id}.localhost:4943`;
        }
    
        console.log(urlProvider);
    
        await new Promise<void>((resolve) => {
            authClient.login({
                identityProvider: urlProvider,
                onSuccess: resolve,
                onError: () => {
                    errorInRegister = true;
                    console.log("test");
                    return undefined;
                }
            });
        });

        if (errorInRegister) {
            console.log("Smn hay error");
            throw new Error("error in function");
        }

        return authClient.getIdentity(); 
}











// export async function getIdentity1(): Promise<ResultGetPrincipal> {
//     const motokoblocks_principal = Principal.fromText(backend_id);

//     let errorInRegister: boolean = false;
//     let urlProvider: string;

//     const authClient = await AuthClient.create();

//     switch (process.env.DFX_NETWORK) {
//         case ("ic"):
//             urlProvider = `https://${internet_identity_id}.ic0.app`;
//         default:
//             urlProvider = `http://${internet_identity_id}.localhost:4943`;
//     }

//     console.log(urlProvider);

//     await new Promise<void>((resolve, reject) => {
//         authClient.login({
//             identityProvider: urlProvider,
//             onSuccess: resolve,
//             onError: () => {
//                 errorInRegister = true;
//             }
//         });
//     });

//     return new Promise<ResultGetPrincipal>((resolve, reject) => {{
//         if (errorInRegister) {
//             resolve(undefined);
//         } else {
//             resolve(authClient.getIdentity());
//         }
//     }});
// }