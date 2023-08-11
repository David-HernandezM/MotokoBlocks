import { HttpAgent, Identity } from '@dfinity/agent';

import { UserPrograms } from '../pages';


// export async function loader(test: any) {
//     const userPrincipal: string = test.params.userPrincipal;
// }

export default function User() {
    return (
        <>
            <UserPrograms />
        </>
    )
}